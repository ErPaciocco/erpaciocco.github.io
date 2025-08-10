---
layout:     post
title:      "All-in one Windows IPC Internals - OLE Overview"
subtitle:   "An overview to OLE Technology correlated to COM ecosystem"
date:       2025-02-02 11:00:00
author:     "ErPaciocco"
header-img: "/images/posts/2025-02-02-windows-ipc-in-depth-4/OLEIntroduction.png"
categories:  Windows
color: blue
---

In the previous post we introduced COM technology, of which I will make a very brief summary to keep in memory the most relevant details.

# COM: Recap

**COM allows methods and properties to be represented in memory in a “standard” way**, so that developers of different languages (and consequently different applications) can, by adapting to this standard, call functions and obtain property values. All in an **OOP fashion**: in fact, it uses inheritance applied to interfaces and “virtual function tables”.

So, COM is an **Application Binary Interface**:
- *language-agnostic*
- *platform-independent*
- *object-oriented*

As a **garbage collection** method, it uses **Reference Counting**.

All COM objects are derived from at least one basic interface: `IUnknown`, which provides essential methods for each object (`AddRef`, `Release`, and `QueryInterface`).

Each COM object has its own **unique CLSID** which is a mandatory GUID to set in Registry Editor for COM registration, while the **ProgID**, the “human” name of the related COM functionality, is optional.


Each COM object is:

+ A *.dll* or an *.ocx* if set up as an **In-Process Server**. This does not appear in the Task Manager and resides in the address space of the same process that uses it.

+ An *.exe* if set up as a **Local Server**. Having a separate PID, it appears in the Task Manager and is in a different address space from the process that uses it. For communication between COM client and COM server, in this case, RPC mechanisms with related *“proxies”* and *“stubs”* also come into play.

Windows has awareness of registered COM objects via the registry: `HKLM\Software\CLSID` or `HKCU\Software\Classes\CLSID`, while it has awareness of active COM instances via the system **Running Object Table** (ROT). It is used to retrieve specific *active instances of COM objects*, without going to recreate them each time with `CoCreateInstance`.


*Well, now let's jump into Object Linking and Embedding (OLE)!*

---

# OLE

**OLE is a proprietary Microsoft technology that allows the embedding and linking of documents and other objects.**
You know when, in Microsoft Word, you add an object, which can be an Excel Worksheet or a Bitmap, into the open document, and you can edit or copy it just by clicking on it? There, the magic behind it is all from OLE.

As already written in the Microsoft documentation, OLE relies heavily on COM technology. To take advantage of all its features, OLE also has an associated file format: **Microsoft Compound File Binary (CFB)**.

### Basic Overview

We must distinguish, in the OLE context, the types of applications:
+ **Container Application**: the “parent” application that embeds OLE objects in its documents (e.g., Microsoft Word)

+ **Full Server Application**: the “child” application that creates OLE objects to be represented in a Container Application (e.g. Microsoft Excel, although it is a special case of container-server dualism as we will see later)

+ **MiniServer Application**: particular Server Application that cannot be started as a stand-alone executable but needs a Container Application to be displayed (e.g. Microsoft Graph)

> <div style="display: table"><div style="display: table-cell; width: 10%; vertical-align: middle; text-align: center; padding-right: 10px"><div class="w-8 h-8 rounded-full" style="background-color: #50c878; font-size: 3.5em"></div> </div><div style="font-weight: 300; width: 90%; display: table-cell; vertical-align: middle; text-align: left;"><span class="rubik" style="font-weight: 300;">An application can be both Container and Server.</span></div></div>

<figure style="text-align: center; margin-bottom: 10px">
    <img src="{% vite_asset_path images/posts/2025-02-02-windows-ipc-in-depth-4/ContainerServer.png %}"
         alt="Container & Server Application">
    <figcaption>Container is the surrounding Microsoft Word; Server is Excel Spreadsheet</figcaption>
</figure>

Now that we are clear on these concepts, let us turn to the division between Embedding and Linking:
+ **Embedding**: the Container *contains the OLE object in its entirety*, with all its data

+ **Linking**: the OLE object in the Container *contains only a reference (a Path) to the file*: its contents are not stored in the object

<figure style="text-align: center; margin-bottom: 10px">
    <img src="{% vite_asset_path images/posts/2025-02-02-windows-ipc-in-depth-4/OLELinking.png %}"
         alt="Linking in Microsoft Word">
    <figcaption>Checkbox to enable OLE Link Mode</figcaption>
</figure>

An OLE object can also be edited through a sub-window of the Container window, without opening a new window (as happens when editing an Excel spreadsheet within a Word document). This behavior is known as **In-Place Activation**.

### Storage OLE

Each OLE object has its own representation (which is similar to a mini filesystem inside Windows, with folders, called **Storage**, and files, called **Streams**) on disk, in the form of CFB files, and in memory, via method calls to the `IStorage` and `IPersistStorage` interfaces.
We can see examples of CFB files by opening a .docx as an archive:

<figure style="text-align: center; margin-bottom: 10px">
    <img src="{% vite_asset_path images/posts/2025-02-02-windows-ipc-in-depth-4/OLEContainerApplication.png %}"
         alt="OLE Container Application">
    <figcaption>Microsoft Word Container App with an OLE object embedded</figcaption>
</figure>

<figure style="text-align: center; margin-bottom: 10px">
    <img src="{% vite_asset_path images/posts/2025-02-02-windows-ipc-in-depth-4/OleObjectBin.png %}"
         alt="OLE binary inside .docx archive">
    <figcaption>OLE binary inside .docx archive</figcaption>
</figure>

<figure style="text-align: center; margin-bottom: 10px">
    <img src="{% vite_asset_path images/posts/2025-02-02-windows-ipc-in-depth-4/OLECompoundFileFormat.png %}"
         alt="OLE CFB content extracted by 7zip">
    <figcaption>OLE CFB content extracted by 7zip</figcaption>
</figure>

### OLE Functions

Now, let's imagine that we need to develop a container application and a server application, to communicate via OLE objects.
We will need the `IStorage` and `IPersistStorage` interfaces to **write changes to the OLE object** in memory, but also **to read its data** in order to represent it later. Specifically for `IStorage`:

<div style="line-height:1.6; font-size: 16px; margin-bottom:20px">

<span style="font-size:13px; color: orange"># </span><b style="color: gold; font-family: rubik; font-weight:300">CreateStorage()</b>: Create a sub-storage (similar to a folder)<br>

<span style="font-size:13px; color: orange"># </span><b style="color: gold; font-family: rubik; font-weight:300">OpenStorage()</b>: Opens an existing sub-storage<br>

<span style="font-size:13px; color: orange"># </span><b style="color: gold; font-family: rubik; font-weight:300">CreateStream()</b>: Create a new Stream (similar to a file)<br>

<span style="font-size:13px; color: orange"># </span><b style="color: gold; font-family: rubik; font-weight:300">OpenStream()</b>: Opens an existing stream<br>

<span style="font-size:13px; color: orange"># </span><b style="color: gold; font-family: rubik; font-weight:300">Commit()</b>: Write storage changes to disk<br>

<span style="font-size:13px; color: orange"># </span><b style="color: gold; font-family: rubik; font-weight:300">Revert()</b>: Undo non-commited changes<br>

</div>

> <div style="display: table"><div style="display: table-cell; width: 10%; vertical-align: middle; text-align: center; padding-right: 10px"><div class="w-8 h-8 rounded-full" style="background-color: #50c878; font-size: 3.5em"></div> </div><div style="font-weight: 300; width: 90%; display: table-cell; vertical-align: middle; text-align: left;"><span class="rubik" style="font-weight: 300;">To write the storage to disk we will instead use <b>StgCreateDocfile()</b>.</span></div></div>

The `IOleObject` interface is implemented by the server (OLE object) and **allows communication and object management between the container and the OLE object**, whether the object is embedded or attached. Its most important methods are:

<div style="line-height:1.6; font-size: 16px; margin-bottom:20px">

<span style="font-size:13px; color: orange"># </span><b style="color: gold; font-family: rubik; font-weight:300">DoVerb()</b>: Performs the desired action on an object based on the “verb” passed as a parameter. For example, it is used for “in-place activation”. Available “verbs” are recorded in the System Registry<br>

<span style="font-size:13px; color: orange"># </span><b style="color: gold; font-family: rubik; font-weight:300">Update()</b>: Called by the container, it invokes an update of the representation of the OLE object<br>

<span style="font-size:13px; color: orange"># </span><b style="color: gold; font-family: rubik; font-weight:300">SetClientSite()</b>: Sets the “client site”, the environment that hosts the object<br>

<span style="font-size:13px; color: orange"># </span><b style="color: gold; font-family: rubik; font-weight:300">SetMoniker()</b>: Sets a moniker to uniquely identify the object OLE<br>

</div>

The `IOleClientSite` interface is implemented by the container and is unique per component. Through this **an OLE object can receive information about the location and size of its representation, its moniker, its UI, and more**.

<div style="line-height:1.6; font-size: 16px; margin-bottom:20px">

<span style="font-size:13px; color: orange"># </span><b style="color: gold; font-family: rubik; font-weight:300">SaveObject()</b>: Saves embedded object<br>

<span style="font-size:13px; color: orange"># </span><b style="color: gold; font-family: rubik; font-weight:300">GetMoniker()</b>: Requests object's moniker<br>

<span style="font-size:13px; color: orange"># </span><b style="color: gold; font-family: rubik; font-weight:300">GetContainer()</b>: Requests pointer to object's container<br>

<span style="font-size:13px; color: orange"># </span><b style="color: gold; font-family: rubik; font-weight:300">ShowObject()</b>: Asks container to display object<br>

<span style="font-size:13px; color: orange"># </span><b style="color: gold; font-family: rubik; font-weight:300">OnShowWindow()</b>: Notifies container when object becomes visible or invisible<br>

</div>


The `IAdviseSink` interface is implemented by the container, and **its methods are called by an OLE object to alert it to changes in the data, view, name, or state of the object**. Here are its methods:

<div style="line-height:1.6; font-size: 16px; margin-bottom:20px">

<span style="font-size:13px; color: orange"># </span><b style="color: gold; font-family: rubik; font-weight:300">IAdviseSink::OnClose()</b><br>

<span style="font-size:13px; color: orange"># </span><b style="color: gold; font-family: rubik; font-weight:300">IAdviseSink::OnDataChange()</b><br>

<span style="font-size:13px; color: orange"># </span><b style="color: gold; font-family: rubik; font-weight:300">IAdviseSink::OnRename()</b><br>

<span style="font-size:13px; color: orange"># </span><b style="color: gold; font-family: rubik; font-weight:300">IAdviseSink::OnSave()</b><br>

<span style="font-size:13px; color: orange"># </span><b style="color: gold; font-family: rubik; font-weight:300">IAdviseSink::OnViewChange()</b><br>

</div>


### CFB format.
If you would like a more in-depth discussion of the Microsoft format for storing OLE objects on disk, please write it in the comments and I will be happy to accommodate you.
I am sending you a link to download the documentation for this format:
[MS-OLEDS Page](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-oleds/85583d21-c1cf-4afe-a35f-d6701c5fbb6f)

---

# CONCLUSION
We have seen how there is a world behind the term OLE. Do an experiment: with APIMonitor, try to see how many OLE/COM calls are made when, for example, you create or modify an object: you will find matches with the theory we have learned so far.

*What can we say...see you next time!*