'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, List, Lightbulb, RefreshCw, Download, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseAndRenderContent } from '@/app/(user)/artikel/[slug]/page';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


export default function HasilPage() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [detailsVisible, setDetailsVisible] = useState(false);

    useEffect(() => {
        const storedResult = localStorage.getItem('diagnosisResult');
        if (storedResult) {
            setResult(JSON.parse(storedResult));
        }
        setLoading(false);
    }, []);

    const getCategoryStyles = (kategori) => {
        const lowerKategori = kategori ? kategori.toLowerCase() : '';
        if (lowerKategori.includes('kecanduan') || lowerKategori.includes('tinggi')) {
            return { 
                bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', 
                progress: '#ef4444', rgb: [239, 68, 68],
                description: "Hasil ini menunjukkan adanya indikasi kuat kecanduan gadget. Penting untuk segera mengambil langkah-langkah perbaikan."
            };
        }
        if (lowerKategori.includes('waspada') || lowerKategori.includes('sedang')) {
            return { 
                bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-400', 
                progress: '#eab308', rgb: [234, 179, 8],
                description: "Anda menunjukkan beberapa gejala yang perlu diwaspadai. Mengatur pola penggunaan gadget adalah langkah yang bijak."
            };
        }
        return { 
            bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-400', 
            progress: '#16a34a', rgb: [22, 163, 74],
            description: "Selamat! Tingkat penggunaan gadget Anda masih dalam kategori normal. Pertahankan kebiasaan baik ini."
        };
    };

    const renderSlateContent = (doc, slateJSON, startY, addHeaderFooter) => {
        let y = startY;
        if (!slateJSON) return y;

        let nodes;
        try {
            nodes = JSON.parse(slateJSON);
        } catch (error) {
            console.error("Gagal mem-parsing JSON solusi:", error);
            return y;
        }
    
        const normalFontSize = 10;
        const textMargin = 15;
        const pageWrapWidth = doc.internal.pageSize.getWidth() - (textMargin * 2);
        const lineHeight = 5.5;
    
        nodes.forEach(node => {
            const checkPageBreak = (neededHeight) => {
                if (y + neededHeight > 270) {
                    doc.addPage();
                    addHeaderFooter();
                    y = 40;
                }
            };
    
            if (node.type === 'paragraph') {
                let line = '';
                (node.children || []).forEach(child => { if (child.text) line += child.text; });
                const textLines = doc.splitTextToSize(line.trim(), pageWrapWidth);
                checkPageBreak(textLines.length * lineHeight);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(normalFontSize);
                doc.setTextColor(80, 80, 80);
                doc.text(textLines, textMargin, y);
                y += textLines.length * lineHeight + (lineHeight / 2);
            } 
            else if (node.type === 'numbered-list') {
                let itemCounter = 1;
                (node.children || []).forEach(listItem => {
                    let line = '';
                    (listItem.children || []).forEach(textPart => { line += textPart.text || ''; });
                    const fullLine = `${itemCounter}. ${line.trim()}`;
                    const textLines = doc.splitTextToSize(fullLine, pageWrapWidth - 7);
                    checkPageBreak(textLines.length * lineHeight);
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(normalFontSize);
                    doc.setTextColor(80, 80, 80);
                    doc.text(textLines, textMargin + 7, y);
                    y += textLines.length * lineHeight;
                    itemCounter++;
                });
                y += lineHeight;
            }
        });
        return y;
    };

    const handleDownload = () => {
        const doc = new jsPDF();
        const styles = getCategoryStyles(result.kategori);
        
        const primaryColor = [37, 99, 235]; 
        const categoryColor = styles.rgb; 
        
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
        
        const addHeaderFooter = () => {
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(18);
                doc.setTextColor(50, 50, 50);
                doc.text("Laporan Hasil Diagnosa SIPIKAT", pageWidth / 2, 20, { align: 'center' });
                
                doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                doc.setLineWidth(0.5);
                doc.line(15, 25, pageWidth - 15, 25);

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                const footerText = `Halaman ${i} dari ${pageCount}`;
                doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
                doc.text(`Dokumen ini dibuat secara otomatis oleh SIPIKAT.`, 15, pageHeight - 10);
            }
        };

        let y = 35; 

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text("1. Informasi Pasien & Hasil Diagnosa", 15, y);
        y += 8;

        const combinedData = [
            { title: 'Nama Lengkap', value: result.user.nama },
            { title: 'Usia', value: `${result.user.usia} tahun` },
            { title: 'Jenis Kelamin', value: result.user.jenis_kelamin },
            { title: 'Alamat', value: result.user.alamat },
            { title: 'Tanggal Diagnosa', value: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric'}) },
            { title: 'Tingkat Kecanduan', value: `${parseFloat((result.total_cf * 100).toFixed(2))}%` },
            { title: 'Hasil Diagnosa', value: result.kategori.toUpperCase() },
        ];

        autoTable(doc, {
            startY: y,
            body: combinedData.map(item => [item.title, ':', item.value]),
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 1.5 },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 45 },
                1: { cellWidth: 5 },
                2: { cellWidth: 'auto' }
            },
            didParseCell: (data) => {
                if (data.row.raw[0] === 'Hasil Diagnosa') {
                    const valueCell = data.row.cells[2];
                    if (valueCell) {
                        valueCell.styles.textColor = categoryColor;
                        valueCell.styles.fontStyle = 'bold';
                        valueCell.styles.fontSize = 12;
                    }
                }
                if (data.row.raw[0] === 'Tingkat Kecanduan') {
                    const valueCell = data.row.cells[2];
                    if (valueCell) {
                        valueCell.styles.fontStyle = 'bold';
                    }
                }
            }
        });
        y = doc.lastAutoTable.finalY + 12;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text("2. Gejala yang Dialami", 15, y);
        y += 8;

        const symptomsData = result.gejala_terpilih.map(g => [g.gejala, `${(g.cf_user * 100).toFixed(0)}%`]);
        autoTable(doc, {
            startY: y,
            head: [['Deskripsi Gejala', 'Tingkat Keyakinan']],
            body: symptomsData,
            theme: 'striped',
            headStyles: { 
                fillColor: [55, 65, 81],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 40, halign: 'center' }
            }
        });
        y = doc.lastAutoTable.finalY + 12;
        
        if (y > 200) {
            doc.addPage();
            y = 40;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text("3. Solusi dan Rekomendasi", 15, y);
        y += 10;
        
        y = renderSlateContent(doc, result.solusi, y, () => addHeaderFooter()); 
        
        addHeaderFooter();

        doc.save(`Hasil Diagnosa - ${result.user.nama.replace(/\s/g, '_')}.pdf`);
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-lg text-gray-600">Memuat hasil...</div>;
    }

    if (!result) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                 <div className="text-center bg-white p-10 rounded-xl shadow-xl border">
                     <h1 className="text-2xl font-bold text-gray-800 mb-4">Hasil Tidak Ditemukan</h1>
                     <p className="mb-8 text-gray-600">Sepertinya Anda belum melakukan diagnosa atau sesi telah berakhir.</p>
                     <Link href="/diagnosa" className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105">
                         <ArrowLeft className="mr-2 h-5 w-5" />
                         Kembali ke Halaman Diagnosa
                     </Link>
                 </div>
            </div>
        );
    }

    const percentage = parseFloat((result.total_cf * 100).toFixed(2));
    const styles = getCategoryStyles(result.kategori);

    return (
        <div className="min-h-screen bg-gray-50 py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
            <motion.div
              className="max-w-3xl mx-auto space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
                <div className="text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
                        Hasil Diagnosa Anda
                    </h1>
                    <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-600">
                        Berikut adalah ringkasan analisis berdasarkan gejala yang Anda berikan.
                    </p>
                </div>

                <section className={`p-8 rounded-2xl shadow-lg border text-center ${styles.bg} ${styles.border}`}>
                    <h1 className={`text-3xl font-bold ${styles.text}`}>Hasil: {result.kategori}</h1>
                    <p className={`mt-2 text-6xl font-extrabold ${styles.text}`}>{percentage}%</p>
                    <p className={`mt-4 max-w-xl mx-auto ${styles.text}`}>
                        {styles.description}
                    </p>
                </section>

                <section className="bg-white p-8 rounded-2xl shadow-md border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-3 rounded-full">
                           <Lightbulb className="h-6 w-6 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Langkah Selanjutnya & Rekomendasi</h2>
                    </div>
                    <div className="mt-6 prose prose-lg max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: parseAndRenderContent(result.solusi) }} />
                </section>

                <section className="bg-white rounded-2xl shadow-md border border-gray-200">
                    <button 
                        onClick={() => setDetailsVisible(!detailsVisible)}
                        className="w-full flex justify-between items-center p-6 text-left"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-gray-100 p-3 rounded-full">
                               <List className="h-6 w-6 text-gray-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Lihat Rincian Diagnosa</h2>
                        </div>
                        <ChevronDown className={`h-6 w-6 text-gray-500 transition-transform ${detailsVisible ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                        {detailsVisible && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="border-t border-gray-200 p-8 space-y-6">
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-700 mb-2">Data Pasien</h3>
                                        <div className="text-gray-600 space-y-1">
                                            <p><strong>Nama:</strong> {result.user.nama}</p>
                                            <p><strong>Usia:</strong> {result.user.usia} tahun</p>
                                            <p><strong>Jenis Kelamin:</strong> {result.user.jenis_kelamin}</p>
                                            <p><strong>Alamat:</strong> {result.user.alamat}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-700 mb-2">Gejala yang Dialami</h3>
                                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                                            {result.gejala_terpilih.map(g => (
                                                <li key={g.id}>
                                                    {g.gejala} <span className="text-gray-500 text-sm">- ({(g.cf_user * 100).toFixed(0)}% yakin)</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>
                
                <section className="pt-4">
                     <div className="flex flex-col sm:flex-row sm:justify-center gap-4">
                         <button
                             onClick={handleDownload}
                             className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
                         >
                             <Download className="mr-2 h-5 w-5" />
                             Unduh Laporan PDF
                         </button>
                         <Link 
                             href="/diagnosa" 
                             className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-200 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-transform transform hover:scale-105"
                         >
                             <RefreshCw className="mr-2 h-5 w-5" />
                             Lakukan Diagnosa Ulang
                         </Link>
                     </div>
                </section>
            </motion.div>
        </div>
    );
}