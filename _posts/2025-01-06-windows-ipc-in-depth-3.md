---
layout:     post
title:      "All-in one Windows IPC Internals - COM Overview"
subtitle:   "An overview to COM Binary Interface in Windows"
date:       2025-01-06 11:00:00
author:     "ErPaciocco"
header-img: "/images/posts/2025-01-06-windows-ipc-in-depth-3/TypeLib.png"
categories:  Windows
color: blue
---

Now that we have seen DDE technology, we will have noticed some of its limitations. Let's compare them with the newcomer COM that we will now examine

(DDE =><span style="color: lightgreen"> GREEN</span>; COM =><span style="color: orange"> ORANGE</span>):

<div style="padding-left: 1em; line-height:1.8; font-size: 16px; font-weight: 200">
<div><span style="font-size:20px;">1.</span> <span style="font-weight: light">DDE uses <i style="color: lightgreen">window messages</i> for communication, which makes it slower and more complex. COM uses <b style="color: orange">native function calls</b>, which are generally faster.</span></div>
<div><span style="font-size:20px">2.</span> <span style="font-weight: light">If a window does not respond in time to a DDE message, this can cause a <i style="color: lightgreen">deadlock</i> or infinite wait condition if the DDE server does not implement a way to <i  style="color: lightgreen">notify the client of its “deadlock”</i> (via the <i>fBusy</i> member of the <i>WM_DDE_ACK</i> message at 1). COM incorporates <b style="color: orange">error handling mechanisms</b>, and deadlocks are much less frequent.</span></div>
<div><span style="font-size:20px">3.</span> <span style="font-weight: light">DDE is limited to <i  style="color: lightgreen">local window communications</i>, while COM supports <b style="color: orange">local and remote communications</b> (via DCOM).</span></div>
<div><span style="font-size:20px">4.</span> <span style="font-weight: light">DDE is limited to the <i style="color: lightgreen">exchange of strings and raw data</i>, COM is based on an <b style="color: orange">object-oriented model</b>, with features such as <b style="color: orange">polymorphism, inheritance, and code reuse</b>.</span></div>
</div>

In general, COM, now widely used in the Windows ecosystem, is considered more secure, efficient and versatile than the deprecated DDE.

Let's see how it works!

---

### COM
#### Introduction

Let's read the official MSDN documentation first, then I will give you my own definition:

<pre><code>COM is a platform-independent, distributed, object-oriented system for creating binary software components that can interact. COM is the foundation technology for Microsoft's OLE (compound documents) and ActiveX (Internet-enabled components) technologies."</code></pre>

Simply put, COM provides a **standard** (component-based) way to *write code that is callable by different programming languages* (it is **language-agnostic**) *and different programs*. All of these, through a well-defined COM API, know how and where to find COM functions and how to call them. It is no accident that it is called **COM Application Binary Interface**, and now we will see practically why COM is so easy to be called.


<figure style="text-align: center">
    <img src="{% vite_asset_path images/posts/2025-01-06-windows-ipc-in-depth-3/COMComponent.png %}"
         alt="COM Component Virtual Table Structure">
    <figcaption>COM Component Virtual Table Structure</figcaption>
</figure>

#### Foundamental Notions

Let's begin by saying that each COM component provides a service. A COM component practically, as we shall see, is nothing more than a DLL or EXE that implements COM interfaces.
Each COM component derives (and must derive) from a base interface called `IUnknown`, along with one or more other interfaces. For example, the COM object *“Common Item Dialog”* cascades all the methods and properties of the interfaces from which it is derived, as shown in the figure below.

<figure style="text-align: center">
    <img src="{% vite_asset_path images/posts/2025-01-06-windows-ipc-in-depth-3/COMInheritanceTree.png %}"
         alt="Inheritance Tree of a COM Component">
    <figcaption>Inheritance Tree of "Common Item Dialog"</figcaption>
</figure>

This IUnknown interface exposes three methods, which are fundamental to the life cycle of a COM object:
- `AddRef`
- `Release`
- `QueryInterface`

<figure style="text-align: center">
    <img src="{% vite_asset_path images/posts/2025-01-06-windows-ipc-in-depth-3/IUnknown.png %}"
         alt="IUnknown Interface">
    <figcaption>IUnknown Interface Methods</figcaption>
</figure>

> <div style="display: table"><div style="display: table-cell; width: 10%; vertical-align: middle; text-align: center; padding-right: 10px"><div class="w-8 h-8 rounded-full" style="background-color: #50c878; font-size: 3.5em"></div> </div><div style="font-weight: 300; width: 90%; display: table-cell; vertical-align: middle; text-align: left;"><span class="rubik" style="font-weight: 300;">COM uses an object lifecycle management method called <b>Reference Counting</b>. Once an object is instantiated, its counter is initialized to 1. Each copy of this object increments its counter by 1, and each of its Releases decrements it by 1. When the counter reaches 0, the object is automatically finalized.</span></div></div>

---

`AddRef` is called when *another COM component uses the interface*; `Release` is called when *this component should no longer use the interface*; `QueryInterface` allows *runtime discovery of other interfaces supported by the COM object*. If the interface exists, QueryInterface returns a pointer to its vft; if it does not exist it returns an error code.

#### CLSID and ProgID

Each COM object has assigned a unique GUID called **CLSID**, and a “text” version of it called **ProgID**, which we will see is especially useful in DCOM calls. Each of these is registered in Windows in registry keys in `HKEY_CLASSES_ROOT\CLSID` (`HKLM\Software\CLSID` or `HKCU\Software\Classes\CLSID`).

<figure style="text-align: center">
    <img src="{% vite_asset_path images/posts/2025-01-06-windows-ipc-in-depth-3/Word.ApplicationProgID.png %}"
         alt="Word ProgID">
    <figcaption>Word.Application ProgID</figcaption>
</figure>

### COM: DEVELOPER NOTES
#### COM Server Types

COM uses a **client-server** model, where there is a client COM (which can be a compiled application, scripts, VBA code, etc.) and a COM Server, which can be:

<div style="line-height:1.6; font-size: 16px">

<span style="font-size:13px; color: orange">#</span><b style="color: gold">In-Process Server</b>: it is loaded into memory in the client application. They are usually <i>.dll</i> or <i>.ocx</i><br>

<span style="font-size:13px; color: orange">#</span><b style="color: gold">Local Server</b>: it is a separate application with its own PID. They are usually <i>.exe</i> files.<br>

<span style="font-size:13px; color: orange">#</span><b style="color: gold">Remote Server</b>: they are COM services hosted on machines other than the client COM. They are called procedures found in Remote Servers using DCOM and RPC.

</div>


#### COM Apartments

In addition, all COM objects are divided into groups called <b>“apartments”</b>. There are two types of apartments in COM:
1. <b>Single-Threaded Apartment (STA)</b>: each COM object residing in an STA can be used only by the thread with which it is associated. If another thread wants to access an object in an STA, COM uses “marshalling” to send the request to the correct thread. Windows message loop is used to read and execute requests one at a time.
2. <b>Multi-Threaded Apartment (MTA)</b>: is used for COM objects designed to have multiple concurrent accesses from different threads. Objects in an MTA must be thread-safe. Any thread can access them directly without marshalling.
Each COM object belongs to exactly one apartment.

#### Some of the most used COM Interfaces

<div style="line-height:1.6; font-size: 16px">

<span style="font-size:13px; color: yellow">#</span><b style="color: orange; font-size: 18px">IDispatch</b>: provides support for “late binding,” that is, it allows methods to be called and properties of a COM object to be accessed at runtime. Some of its methods are:<br>
<blockquote><span style="font-size:13px; color: yellow">+</span><b style="color: darkorange">GetTypeInfo</b>: retrieves information about the type of the object.<br>
<span style="font-size:13px; color: yellow">+</span><b style="color: darkorange">GetIDofNames</b>: each method or property has its own DISPID, which uniquely identifies it.<br>
<span style="font-size:13px; color: yellow">+</span><b style="color: darkorange">Invoke</b>: executes methods or reads properties by their DISPID.</blockquote><br>
<span style="font-size:13px; color: yellow">#</span><b style="color: orange; font-size: 18px">IPersist</b>: provides methods to save and load the state of an object.<br>
<blockquote><span style="font-size:13px; color: yellow">+</span><b style="color: darkorange">GetClassID</b>: obtains the CLSID of an object.</blockquote><br>
<span style="font-size:13px; color: yellow">#</span><b style="color: orange; font-size: 18px">IStream</b>: provides methods to read, write and manage sequential data streams.<br>
<blockquote><span style="font-size:13px; color: yellow">+</span><b style="color: darkorange">Read</b>: reads n bytes from a stream.<br>
<span style="font-size:13px; color: yellow">+</span><b style="color: darkorange">Write</b>: writes n bytes to a stream.<br>
<span style="font-size:13px; color: yellow">+</span><b style="color: darkorange">Seek</b>: moves the stream pointer to a specified location.</blockquote><br>
<span style="font-size:13px; color: yellow">#</span><b style="color: orange; font-size: 18px">IClassFactory</b>: allows the creation of COM objects.<br>
<blockquote><span style="font-size:13px; color: yellow">+</span><b style="color: darkorange">CreateInstance</b>: creates an instance of a COM object.<br>
<span style="font-size:13px; color: yellow">+</span><b style="color: darkorange">LockServer</b>: prevents the server from being dumped from memory.</blockquote><br>
<span style="font-size:13px; color: yellow">#</span><b style="color: orange; font-size: 18px">IMoniker</b>: allows referencing and then linking other COM objects.<br>
</div>

#### Example of a COM Interface in C++
Let's take an official example from Microsoft documentation:<br>
[https://learn.microsoft.com/en-us/windows/win32/learnwin32/example--the-open-dialog-box](https://learn.microsoft.com/en-us/windows/win32/learnwin32/example--the-open-dialog-box)

<pre><code class="language-c++">
#include &lt;windows.h&gt;
#include &lt;shobjidl.h&gt; 

int WINAPI wWinMain(HINSTANCE hInstance, HINSTANCE, PWSTR pCmdLine, int nCmdShow)
{
    HRESULT hr = CoInitializeEx(NULL, COINIT_APARTMENTTHREADED | 
        COINIT_DISABLE_OLE1DDE);
    if (SUCCEEDED(hr))
    {
        IFileOpenDialog *pFileOpen;

        // Create the FileOpenDialog object.
        hr = CoCreateInstance(CLSID_FileOpenDialog, NULL, CLSCTX_ALL, 
                IID_IFileOpenDialog, reinterpret_cast<void**>(&pFileOpen));

        if (SUCCEEDED(hr))
        {
            // Show the Open dialog box.
            hr = pFileOpen->Show(NULL);

            // Get the file name from the dialog box.
            if (SUCCEEDED(hr))
            {
                IShellItem *pItem;
                hr = pFileOpen->GetResult(&pItem);
                if (SUCCEEDED(hr))
                {
                    PWSTR pszFilePath;
                    hr = pItem->GetDisplayName(SIGDN_FILESYSPATH, &pszFilePath);

                    // Display the file name to the user.
                    if (SUCCEEDED(hr))
                    {
                        MessageBoxW(NULL, pszFilePath, L"File Path", MB_OK);
                        CoTaskMemFree(pszFilePath);
                    }
                    pItem->Release();
                }
            }
            pFileOpen->Release();
        }
        CoUninitialize();
    }
    return 0;
}
</code></pre>

Let me explain step by step:
1. **CoInitializeEx**: call needed to allow the calling thread to use the COM library and to create a new apartment for the thread if required.
2. **CoCreateInstance**: creates the “Common Item Dialog” object from its CLSID and has a pointer returned, specifying the Interface ID, to an IFileOpenDialog instance
3. Calls the **Show** method of the same interface, which displays a dialog box to the user
4. Call the **GetResult** method, which returns a pointer to the chosen file, a “Shell Item” object that implements IShellItem.
5. Calls the **GetDisplayName** method of IShellItem and displays a MessageBox
6. Call **CoUninitialize** to finalize the COM library.

> <div style="display: table"><div style="display: table-cell; width: 10%; vertical-align: middle; text-align: center; padding-right: 10px"><i class="fa-solid fa-lightbulb" style="color: #ffd740; font-size: 4em"></i> </div><div style="font-weight: 300; width: 90%; display: table-cell; vertical-align: middle; text-align: left;"><span class="rubik" style="font-weight: 300;">Recall that every COM resource and pointer should always be freed when no longer used, either by <i>Release</i> or <i>CoTaskMemFree</i>. CoTaskMemFree represents a sort of wrapper for <i>free</i> and <i>delete</i> operations, since COM was born to be “language-agnostic.”</span></div></div>

#### COM & Registry Editor

Each COM object and interface, i.e., each CLSID and ProgID and their respective IIDs are all maintained in the Windows registry, as the images below demonstrate.

<figure style="text-align: center">
    <img src="{% vite_asset_path images/posts/2025-01-06-windows-ipc-in-depth-3/COMInProcServer32.png %}"
         alt="COM InProcServer32">
    <figcaption>COM InProcServer32</figcaption>
</figure>

<figure style="text-align: center">
    <img src="{% vite_asset_path images/posts/2025-01-06-windows-ipc-in-depth-3/COMLocalServer32.png %}"
         alt="COM LocalServer32">
    <figcaption>COM LocalServer32</figcaption>
</figure>

<figure style="text-align: center">
    <img src="{% vite_asset_path images/posts/2025-01-06-windows-ipc-in-depth-3/FormsTabStrip.png %}"
         alt="COM Microsoft Forms 2.0 TabStrip">
    <figcaption>COM Microsoft Forms 2.0 TabStrip</figcaption>
</figure>

<figure style="text-align: center">
    <img src="{% vite_asset_path images/posts/2025-01-06-windows-ipc-in-depth-3/TypeLib.png %}"
         alt="COM TypeLib">
    <figcaption>COM TypeLib</figcaption>
</figure>

<figure style="text-align: center">
    <img src="{% vite_asset_path images/posts/2025-01-06-windows-ipc-in-depth-3/COMVersionIndependentProgID.png %}"
         alt="COM VersionIndependentProgID">
    <figcaption>COM VersionIndependentProgID</figcaption>
</figure>

### TypeLib

A **“type library”** (.tlb) is a binary file that stores information about an object's COM and DCOM properties and methods, in a form accessible by other applications at runtime. Through the type library, *the methods and properties exposed by an object are determined*. Definitions are in a format called **IDL**, *Interface Definition Language*.

<figure style="text-align: center">
    <img src="{% vite_asset_path images/posts/2025-01-06-windows-ipc-in-depth-3/HHCtrlTLB.png %}"
         alt="HHCtrl TLB">
    <figcaption>HHCtrl TLB</figcaption>
</figure>

---

### TOOLS

[OleViewDotNet v1.16](https://www.powershellgallery.com/packages/OleViewDotNet/1.16)

### REFERENCES
[https://learn.microsoft.com/it-it/windows/win32/learnwin32/error-handling-in-com](https://learn.microsoft.com/it-it/windows/win32/learnwin32/error-handling-in-com)<br>
Error handling in COM: gives an idea of COM error codes.<br>
[https://learn.microsoft.com/it-it/windows/win32/learnwin32/module-2--using-com-in-your-windows-program](https://learn.microsoft.com/it-it/windows/win32/learnwin32/module-2--using-com-in-your-windows-program)<br>
Windows COM Overview<br>
[https://www.cs.umd.edu/~pugh/com/](https://www.cs.umd.edu/~pugh/com/)<br>
Analysis of the COM world: University of Maryland<br>
[https://hackyboiz.github.io/2024/11/24/ogu123/COM_Object/](https://hackyboiz.github.io/2024/11/24/ogu123/COM_Object/)<br>
Tutorial COM: "hackyboiz"<br>
[https://www.dia.uniroma3.it/autom/Reti_e_Sistemi_Automazione/PDF/COM%20%26%20DCOM.pdf](https://www.dia.uniroma3.it/autom/Reti_e_Sistemi_Automazione/PDF/COM%20%26%20DCOM.pdf)<br>
PPTX UniRoma COM<br>
[https://nolongerset.com/com-server-types/](https://nolongerset.com/com-server-types/)<br>
In-Process, Local & Remote Servers in COM<br>
[https://bohops.com/2018/06/28/abusing-com-registry-structure-clsid-localserver32-inprocserver32/](https://bohops.com/2018/06/28/abusing-com-registry-structure-clsid-localserver32-inprocserver32/)<br>
Attacking COM<br>
[https://mohamed-fakroud.gitbook.io/red-teamings-dojo/windows-internals/playing-around-com-objects-part-1](https://mohamed-fakroud.gitbook.io/red-teamings-dojo/windows-internals/playing-around-com-objects-part-1)<br>
Red Teaming's Dojo perspective<br>

---

We have seen, although without any practical declination, how the COM ecosystem works. In the next blog post we will look in detail at other terminologies often used in these contexts, such as OLE and ActiveX.
See you next time!