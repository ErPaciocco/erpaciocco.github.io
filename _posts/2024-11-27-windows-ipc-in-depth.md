---
layout:     post
title:      "All-in one Windows IPC Internals - Introduction"
subtitle:   "An introduction to interface technologies and component integration in the Windows environment"
date:       2024-11-27 10:00:00
author:     "ErPaciocco"
header-img: "/images/posts/2024-11-27-windows-ipc-in-depth/brainstorming.jpg"
categories:  Windows
color: blue
---

Let's do an experiment...let's try opening <span style="color: #616161">__Microsoft Word__</span> (no matter what version you are using) along with *“API Monitor v2”*. Let's select the Office process from the list of “Running Processes” and start analyzing it. We enable, however, only the intercepting of __“Component Object Model (COM)”__ methods.

We immediately begin to see how much of the COM ecosystem is used just by keeping our Microsoft Word open, let alone starting to write or, even, embed an object.

![Microsoft Word and API Monitor v2](/images/posts/2024-11-27-windows-ipc-in-depth/apimonitor.png)

---

# INTRODUCTION

The *COM world* is thought to be obsolete and no longer used, but, as we will discover in this series, the truth is quite different.
Through the understanding of such items as <span style="color: #b71c1c">__DDE__</span>, <span style="color: #b71c1c">__COM Objects__</span>, <span style="color: #b71c1c">__DCOM__</span>, <span style="color: #b71c1c">__ActiveX__</span>, <span style="color: #b71c1c">__OLE__</span> and <span style="color: #b71c1c">__MSRPC__</span>, you will attain a unified awareness of all these technologies at the end of this journey, from an *offensive* (which I like best) and why not, defensive perspective as well.
If you would then like to find 0day on the Office suite, welcome, know that much of it is based on these technologies.

> <div style="display: table"><div style="display: table-cell; width: 10%; vertical-align: middle; text-align: center; padding-right: 10px"><div class="w-8 h-8 rounded-full" style="background-color: #3d5afe; font-size: 3.5em"></div> </div><div style="font-weight: 300; width: 90%; display: table-cell; vertical-align: middle; text-align: left;"><span class="rubik" style="font-weight: 300;">If you would like to accompany me, as if we were on an afternoon stroll, in having a chat and reflections, the introductory part of the course talks more about “philosophy” than “material technical notions.” If you enjoy discussing these theoretical topics as well, by all means read it. Otherwise you are free to skip to the initial technical chapter.</span></div></div>

# GENERALIZATION AND ABSTRACTION
### HISTORY

Ever since Neolithic times, our ancestors have had the need (and thus the desire) to *“not exert too much effort”*. If we think about it, all technological progress starts from the desire to *“economize”* energy, to “create” methods and tools to be more productive with less effort.

<figure style="text-align: center">
    <img src="{% vite_asset_path images/posts/2024-11-27-windows-ipc-in-depth/agricoltura-neolitico.webp %}"
         alt="Neolithic Agricolture">
    <figcaption>Agriculture and animal husbandry as methods of having ready food and avoiding hunting</figcaption>
</figure>

To create any tool, be it a work tool or any other innovation, it is necessary to “schematize” how the world works, through  <span style="color: #00c853">__generalizations__</span> and  <span style="color: #00c853">__abstractions__</span>.

Let's look at them in detail.
I found on a StackOverflow QA a nice explanation of these two words followed by another great illustration:

> <div style="display: table"><div style="display: table-cell; width: 10%; vertical-align: middle; text-align: center; padding-right: 10px"><div class="w-8 h-8 rounded-full" style="background-color: #ffd740; font-size: 3.5em"></div>  </div><div style="font-weight: 300; width: 90%; display: table-cell; vertical-align: middle; text-align: left;"><span class="rubik" style="font-weight: 300;">While abstraction reduces complexity by hiding irrelevant detail, generalization reduces complexity by replacing multiple entities which perform similar functions with a single construct.</span></div></div>

<figure style="text-align: center">
    <img src="{% vite_asset_path images/posts/2024-11-27-windows-ipc-in-depth/abstract-generalize.png %}"
         alt="Abstraction vs Generalization">
    <figcaption>Abstraction means thay only relevant details are taken into consideration - Generalization groups together objects with same characteristics</figcaption>
</figure>

Here is the definition according to an italian encyclopedia, *Sapere*:

__GENERALIZATION__: (in philosophy) the act, or procedure, by which <span style="color:#ff6d00">the properties of one or more elements of a class are extended to all the elements of that class</span>. Generalization constitutes the raison d'être and end point of all deductive reasoning.

__ABSTRACTION__: a process by which <span style="color:#ff6d00">the human mind constructs universally valid concepts through the analysis of particular elements by isolating them from spatiotemporal context</span>

Although the definitions and differences of these two terms are discordant, the key word here is "<span style="color: #00c853">__simplification__</span>". In fact, these two mechanisms arrive to focus more and on fewer elements than the actual ones, depending on the purpose to be achieved.

> <div style="display: table"><div style="display: table-cell; width: 10%; vertical-align: middle; text-align: center; padding-right: 10px"><div class="w-8 h-8 rounded-full" style="background-color: #3d5afe; font-size: 3.5em"></div>  </div><div style="font-weight: 300; width: 90%; display: table-cell; vertical-align: middle; text-align: left;"><span class="rubik" style="font-weight: 300;">Assume that we are in prehistoric times and we have to grind thick grains of any grain. We have long been doing this with our bare hands, and we have realized that this causes us pain and wear and tear. <br>
At this point then it occurs to us, what can I do to grind these grains quickly? Maybe by not breaking our hands? <br><br>
GENERALIZATION: having had direct experience grinding grains, we generalized their “average hardness”: if every time I grind the grains, they break with a firm punch, then all the grains I have collected and will try to break will break in this way. <br>
ABSTRACTION: to find a way, we then think that we need “something hard and tough,” so that we can beat the grains and break them without breaking the tool.</span></div></div>

At this point, through cognitive processes, comes *insight*, a solution indicated given the initial conditions.

We then used the pillars of our rational thinking, generalization and abstraction, to innovate and economize.

> <div style="display: table"><div style="display: table-cell; width: 10%; vertical-align: middle; text-align: center; padding-right: 10px"><div class="w-8 h-8 rounded-full" style="background-color: #ffd740; font-size: 3.5em"></div>  </div><div style="font-weight: 300; width: 90%; display: table-cell; vertical-align: middle; text-align: left;"><span class="rubik" style="font-weight: 300;">Beware, however, of early recognition of the various logical fallacies and biases arising from the desire to arrive quickly and with less effort at a solution.</span></div></div>

### EVOLUTION

Over time these “unconscious” expedients have been brought to awareness and formalized.

Let us fast forward to modern times...

In the field of development, many principles have been devised in this primitive wake of “the desire to schematize and economize how reality works.”

<div style="line-height:1.5; font-size: 16px">

<b>SOLID</b> (Robert Martin, 2000) <br>

<b>DRY</b> (The Pragmatic Programmer, 1999) <br>

<b>KISS</b> (U.S. Navy, 1960) <br>

<b>DESIGN PATTERNS</b> (Design Patterns: Elements of Reusable Object-Oriented Software). <br>

</div>

Not to mention the emergence of programming paradigms more advanced than procedural programming:

<div style="line-height:1.5; font-size: 16px">

<b>OOP</b> (Object Oriented Programming) <br>

<b>Functional Programming</b> <br>

</div>

***But, in all this, where does Windows fit in?*** 🤔

---

### WINDOWS: FROM PROBLEM TO SOLUTION

The solutions we will see in this series grew out of Microsoft's need to *find a method of inter-process communication that was “standard”*, that is, *one that guaranteed interoperability between programs written in different languages, modularity and reuse*.

> <div style="display: table"><div style="display: table-cell; width: 10%; vertical-align: middle; text-align: center; padding-right: 10px"><div class="w-8 h-8 rounded-full" style="background-color: #3d5afe; font-size: 3.5em"></div> </div><div style="font-weight: 300; width: 90%; display: table-cell; vertical-align: middle; text-align: left;"><span class="rubik" style="font-weight: 300;">In fact, in the beginning, named pipes, sockets, shared files or shared memory had to be used to achieve IPC, but totally independently and at the discretion of the programmer on duty. This therefore resulted in a variety of different implementations, written moreover in different languages, and difficulties in debugging the codes.</span></div></div>

To perform IPC, the Word backend programmer had to know internal details of file, socket, and named pipes management.

Thus, the difficulties were:

<ol style="font-size: 19px; font-family: rubik; font-weight: bold; line-height: 1.8">
<li>Lack of a standard framework</li>

<li>Primitive and inflexible implementations</li>

<li>Interoperability problems</li>

<li>Complicated errors and debugging</li>

<li>Limitations of cooperative multitasking</li>
</ol>

---

# TO BE CONTINUED

I know I have bored you with philosophical arguments, however, from the next post I will begin in a technical way to talk about __the most common IPC mechanisms__ and, later, the first solution devised by Microsoft Windows for this problem: <span style="color: #b71c1c">__Dynamic Data Exchange (DDE)__</span>.

### STAY TUNED!