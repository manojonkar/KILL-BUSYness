import codecs
with codecs.open('temp.txt', 'r', 'utf-16') as f:
    data = f.read()
with codecs.open(r'c:\KILL BUSYness Website\Rebuild\rebuild\source\app\buy\OrderForm.tsx', 'w', 'utf-8') as fw:
    fw.write('"use client";\n\n' + data)
