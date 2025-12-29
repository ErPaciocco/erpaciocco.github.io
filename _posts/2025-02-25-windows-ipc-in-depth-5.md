---
layout:     post
title:      "All-in one Windows IPC Internals - COM Practical Examples"
subtitle:   "Practical code examples for COM Interaction in C++"
date:       2025-02-25 11:00:00
author:     "ErPaciocco"
header-img: "/images/posts/2025-02-25-windows-ipc-in-depth-5/heading.gif"
categories:  Windows
color: blue
---

Now that we have seen quite a bit of theory about the COM world and OLE objects, let's put this into practice. The best way, in my opinion, to consolidate knowledge is through, in this case, the development of C++ software that makes use of these technologies.

### COM#1: Hello World

Let's create an application that initializes a COM object whose custom interface `IGreetings`, once the `Meet` method is called, prints "Hello World!" on the screen.

But let's develop it step by step...

We first create a custom interface that will derive from `IUnknown` (remember? All COM interfaces must derive from `IUnknown`), in this case `IGreetings` and expose its own `Meet` method.


<pre><code class="language-c++ rounded-xl">
#define IID_IGreetings "13371337-1234-1234-abcd-123456789abc"

// Custom IGreetings interface declaration
interface __declspec(uuid(IID_IGreetings))
    IGreetings : public IUnknown {
    virtual HRESULT STDMETHODCALLTYPE Meet() = 0;
};
</code></pre>

We then create a `Greetings` class that will implement the `IGreetings` interface (and thus also `IUnknown`). Note that the implementations of all interface methods are the responsibility of the developer.
+ `QueryInterface` will return the interface with the requested IID
+ `AddRef` will increment the reference counter by 1 via an atomic operation (`InterlockedIncrement`)
+ `Release` will decrement the counter by 1 and, if it reaches 0, delete the object
+ `Meet` will print “Hello World” on the screen.

<pre><code class="language-c++ rounded-xl">
// Casual CLSID to not interfere with other system registered COM CLSIDs
const CLSID CLSID_Greetings = { 0x12345678, 0x1234, 0x1234, {0x12, 0x34, 0x12, 0x34, 0x12, 0x34, 0x12, 0x34} };

// COM Class Implementation
class Greetings : public IGreetings {
private:
    LONG refCount;
public:
    Greetings() : refCount(1) {}

    HRESULT STDMETHODCALLTYPE QueryInterface(REFIID riid, void** ppv) override {
        if (riid == IID_IUnknown || riid == __uuidof(IGreetings)) {
            *ppv = static_cast<IGreetings*>(this);
        }
        else {
            *ppv = nullptr;
            return E_NOINTERFACE;
        }
        AddRef();
        return S_OK;
    }

    // Reference Counting - Method
    ULONG STDMETHODCALLTYPE AddRef() override {
        return InterlockedIncrement(&refCount);
    }

    // Reference Counting - Method
    ULONG STDMETHODCALLTYPE Release() override {
        ULONG count = InterlockedDecrement(&refCount);
        if (count == 0)
            delete this;

        return count;
    }

    //Our custom inherited "Meet" method
    HRESULT STDMETHODCALLTYPE Meet() override {
        std::cout << "Hello World" << std::endl;
        return S_OK;
    }
};
</code></pre>

We will also write a “wrapper” function that will return the interface implementation in one line: `CreateGreetingsInstance`.

<pre><code class="language-c++ rounded-xl">
// If it succeds, **ppv will be populated with callable functions
HRESULT CreateGreetingsInstance(REFCLSID clsid, REFIID riid, void** ppv) {
    if (clsid == CLSID_Greetings) {
        Greetings* pGreetings = new Greetings();
        return pGreetings->QueryInterface(riid, ppv);
    }
    return CLASS_E_CLASSNOTAVAILABLE;
}
</code></pre>


In `main()` we first initialize the COM library. In fact, the first instruction will be `CoInitialize()`. Then we will create a new `Greetings` object and “ask” for the `IGreetings` interface, which is the one that exposes the `Meet()` method.
After calling the method, we will release each resource.

<pre><code class="language-c++ rounded-xl">
int main() {
    //Initialize COM Library on current thread and set concurrency model as STA
    HRESULT coinit = CoInitialize(nullptr);

    if(!SUCCEEDED(coinit))
        std::cerr << "Failed to initialize COM ecosystem" << std::endl;

    IGreetings* pGreetings = nullptr;
    HRESULT hr = CreateGreetingsInstance(CLSID_Greetings, __uuidof(IGreetings), (void**)&pGreetings);

    if (SUCCEEDED(hr)) {
        pGreetings->Meet();
        pGreetings->Release();
    }
    else {
        std::cerr << "Failed to create COM instance" << std::endl;
    }

    //To close the COM library gracefully, each successful call to CoInitialize or CoInitializeEx must be balanced by a call to CoUninitialize
    CoUninitialize();
    return 0;
}
</code></pre>

If you want to play around with this code, make sure to include these "header files":
<pre><code class="language-c++ rounded-xl">
#include &lt;windows.h&gt;
#include &lt;iostream&gt;
#include &lt;objbase.h&gt;
#include &lt;comdef.h&gt;
</code></pre>

If we wanted, we could also add, to show its use, the implementation of the `IClassFactory` interface (only the implementation of `CreateInstance` will be shown). Its methods are used to facilitate the creation of objects in scenarios much more complex than this one:

<pre><code class="language-c++ rounded-xl">
HRESULT STDMETHODCALLTYPE CreateInstance(IUnknown* pUnkOuter, REFIID riid, void** ppv) override
    {
        if (pUnkOuter != nullptr) // COM Aggregation non supportata
            return CLASS_E_NOAGGREGATION;

        Greetings* pGreetings = new Greetings();
        if (!pGreetings)
            return E_OUTOFMEMORY;

        HRESULT hr = pGreetings->QueryInterface(riid, ppv);
        pGreetings->Release();
        return hr;
    }

</code></pre>

As you can see it is just a wrapper of `Greetings pObj = new Greetings()`, which we would have written with one line.

---

### COM#2: A realistic example

A realistic example of how versatile and useful the COM world is: we retrieve a registered COM object, related to `MSXML2.XMLHTTP` (the related file is in *C:\Windows\System32\msxml6.dll*, so understand that we need an *INPROC_SERVER*), and call a method exposed by one of its interfaces `IXMLHTTPRequest` to make a GET request to a remote server.

<pre><code class="language-c++ rounded-xl">
#include &lt;iostream&gt;
#include &lt;comdef.h&gt;
#include &lt;msxml6.h&gt;

#pragma comment(lib, "msxml6.lib")  // Needed for linking

int main() {
    // COM Initialization
    HRESULT hr = CoInitialize(nullptr);
    if (FAILED(hr)) {
        std::cerr << "Error initializing COM" << std::endl;
        return 1;
    }

    try {
        // Creation of COM MSXML2.XMLHTTP
        CLSID clsid;
        hr = CLSIDFromString(L"{88D96A0B-F192-11D4-A65F-0040963251E5}", &clsid);
        if (FAILED(hr)) {
            std::cerr << "Error during retrieval of MSXML2.XMLHTTP CLSID" << std::endl;
            CoUninitialize();
            return 1;
        }

        // Another useful COM interface
        IXMLHTTPRequest* pRequest = nullptr;

        // Creates an object by CLSID and returns a pointer to IXMLHTTPRequest methods implementation
        hr = CoCreateInstance(clsid, nullptr, CLSCTX_INPROC_SERVER, IID_IXMLHTTPRequest, (void**)&pRequest);
        if (FAILED(hr)) {
            std::cerr << "Error during instance creation of MSXML2.XMLHTTP" << std::endl;
            CoUninitialize();
            return 1;
        }

        // GET Request
        hr = pRequest->open(_bstr_t("GET"), _bstr_t("http://www.google.com"), _variant_t(), _variant_t(), _variant_t());
        if (FAILED(hr)) {
            std::cerr << "Error during HTTP session establishment" << std::endl;
            pRequest->Release();
            CoUninitialize();
            return 1;
        }

        // Send the request
        hr = pRequest->send(_variant_t());
        if (FAILED(hr)) {
            std::cerr << "Error sending HTTP request" << std::endl;
            pRequest->Release();
            CoUninitialize();
            return 1;
        }

        // Waiting for server response
        long status = 0;
        pRequest->get_status(&status);

        if (status == 200) {
            // Read response text
            BSTR responseText;
            pRequest->get_responseText(&responseText);
            std::wcout << L"HTTP Response: " << responseText << std::endl;
            SysFreeString(responseText);
        }
        else {
            std::cerr << "HTTP Error - Status Code: " << status << std::endl;
        }

        pRequest->Release();
    }
    catch (const _com_error& e) {
        std::cerr << "COM Exception: " << e.ErrorMessage() << std::endl;
    }

    CoUninitialize();
    return 0;
}
</code></pre>

Worth mentioning are only:
- `CoCreateInstance()`: allows you to create the COM object and return a pointer to one of its interfaces.
- `CLSIDFromString()`: transforms a string representing a CLSID into its native CLSID type
- `open()`,`send()`,`get_status()`,`get_responseText()`: are methods exposed by the `IXMLHttpRequest` interface

> <div style="display: table"><div style="display: table-cell; width: 10%; vertical-align: middle; text-align: center; padding-right: 10px"><div class="w-8 h-8 rounded-full" style="background-color: #50c878"></div> </div><div style="font-weight: 300; width: 90%; display: table-cell; vertical-align: middle; text-align: left;"><span class="rubik" style="font-weight: 300;">Although <i>open()</i> and <i>send()</i> are actually implemented, you won't notice any <i>get_status()</i> and <i>get_responseText()</i> methods in the <i>IXMLHTTPRequest</i> interface, this is because msxml6.h provides these short-hands to get the values of the relevant properties after “get_”.</span></div></div>

---

### Brief Low-Level overview of COM#1

I could take you step by step through debugging the code in the first example, but if you are here I think you will find it more interesting to know how *inheritance* and *polymorphism* is implemented in memory in C++ compilers and, in a very similar way, in COM.

Let's open the "COMWorld1" project on Visual Studio and set a breakpoint on the statement on line 60:
`Greetings* pGreetings = new Greetings()`
after which we continue by one statement. The situation will look like this (with obviously different addresses because of the ASLR enabled):

<figure style="text-align: center; margin-bottom: 10px">
    <img src="{% vite_asset_path images/posts/2025-02-25-windows-ipc-in-depth-5/pGreetings1.png %}"
         alt="Greetings Object #1">
    <figcaption>Object succesfully created</figcaption>
</figure>

As we can see, at address `0x2519b26fbb0` the `pGreetings` object is stored. If we expand the results recursively, we get this:

<figure style="text-align: center; margin-bottom: 10px">
    <img src="{% vite_asset_path images/posts/2025-02-25-windows-ipc-in-depth-5/pGreetings2.png %}"
         alt="Greetings Object #2">
    <figcaption>Object data recursively unfolded</figcaption>
</figure>

Every C++ class instance is represented in memory, in most compilers present today, with this layout:

<figure style="text-align: center; margin-bottom: 10px">
    <img src="{% vite_asset_path images/posts/2025-02-25-windows-ipc-in-depth-5/VTableLayout.png %}"
         alt="VTable Layout">
    <figcaption>VTable Layout (Rif: #1)</figcaption>
</figure>

So we have, typically in the stack, a pointer to a *qword* (we are in x64 environments) which in turn is a pointer to the **Virtual Table** of the class. The Virtual Table contains, in some cases, a first qword 0x0 and a second containing the **Runtime Type Information** fields, while later it definitely contains the **entrypoints** of all the methods of the associated class. In the image we see `method1` and `method2.`
How are **vpointer**, **vtable** and **methods** placed in the memory layout?

<figure style="text-align: center; margin-bottom: 10px">
    <img src="{% vite_asset_path images/posts/2025-02-25-windows-ipc-in-depth-5/VTableLayout2.png %}"
         alt="VPTR & VTBL Memory Regions">
    <figcaption>VPTR & VTBL Memory Regions (Rif: #2)</figcaption>
</figure>

> <div style="display: table"><div style="display: table-cell; width: 10%; vertical-align: middle; text-align: center; padding-right: 10px"><div class="w-8 h-8 rounded-full" style="background-color: #50c878; font-size: 3.5em"></div></div><div style="font-weight: 300; width: 90%; display: table-cell; vertical-align: middle; text-align: left;"><span class="rubik" style="font-weight: 300;">In COM environments, the first methods found in the VTables of COM objects are the addresses of the method implementations of <i>IUnknown</i>, namely <i>QueryInterface</i>, <i>AddRef</i>, and <i>Release</i> (as seen in the screenshot above on Visual Studio).</span></div></div>

---

### Conclusion
In this blog post we explored the COM world with a practical approach.
In the next one we will analyze an **OLE object**!

---

#### References
1. [https://guihao-liang.github.io/2020/05/30/what-is-vtable-in-cpp](https://guihao-liang.github.io/2020/05/30/what-is-vtable-in-cpp)
2. [https://pabloariasal.github.io/2017/06/10/understanding-virtual-tables/](https://pabloariasal.github.io/2017/06/10/understanding-virtual-tables/)
3. [https://www.codeproject.com/Articles/96/Beginners-Tutorial-COM-ATL-Simple-Project](https://www.codeproject.com/Articles/96/Beginners-Tutorial-COM-ATL-Simple-Project)