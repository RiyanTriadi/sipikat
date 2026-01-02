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

    const renderSlateContent = (doc, slateJSON, startY) => {
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
    const textMargin = 20;
    const pageWrapWidth = doc.internal.pageSize.getWidth() - (textMargin * 2);
    const lineHeight = 5;

    nodes.forEach(node => {
        const checkPageBreak = (neededHeight) => {
            if (y + neededHeight > 265) {
                doc.addPage();
                y = 20;
            }
        };

        if (node.type === 'paragraph') {
            let line = '';
            (node.children || []).forEach(child => { if (child.text) line += child.text; });
            const textLines = doc.splitTextToSize(line.trim(), pageWrapWidth);
            checkPageBreak(textLines.length * lineHeight + 5);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(normalFontSize);
            doc.setTextColor(40, 40, 40);
            doc.text(textLines, textMargin, y);
            y += textLines.length * lineHeight + 3;
        } 
        else if (node.type === 'numbered-list') {
            let itemCounter = 1;
            (node.children || []).forEach(listItem => {
                let line = '';
                (listItem.children || []).forEach(textPart => { line += textPart.text || ''; });
                const fullLine = `${itemCounter}. ${line.trim()}`;
                const textLines = doc.splitTextToSize(fullLine, pageWrapWidth - 10);
                checkPageBreak(textLines.length * lineHeight);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(normalFontSize);
                doc.setTextColor(40, 40, 40);
                doc.text(textLines, textMargin + 5, y);
                y += textLines.length * lineHeight + 2;
                itemCounter++;
            });
            y += 3;
        }
    });
    return y;
};

const handleDownload = () => {
    const doc = new jsPDF();
    
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    
    // Header dengan kop surat profesional
    const addHeader = () => {
        // Logo placeholder atau inisial
        doc.setFillColor(30, 58, 138); // Biru profesional gelap
        doc.rect(20, 15, 3, 20, 'F');
        
        // Nama sistem/institusi
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(30, 58, 138);
        doc.text("SIPIKAT", 26, 22);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text("Sistem Pakar Identifikasi Kecanduan Gadget", 26, 27);
        doc.text("Laporan Hasil Pemeriksaan", 26, 32);
        
        // Garis pembatas
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(20, 38, pageWidth - 20, 38);
    };
    
    // Footer profesional
    const addFooter = (pageNum, totalPages) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        
        // Nomor halaman
        doc.text(`Halaman ${pageNum} dari ${totalPages}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
        
        // Informasi dokumen
        doc.text(`Dokumen dibuat: ${new Date().toLocaleDateString('id-ID')}`, 20, pageHeight - 10);
    };

    addHeader();
    
    let y = 50;

    // Section 1: Informasi Pemeriksaan
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 58, 138);
    doc.text("I. INFORMASI PEMERIKSAAN", 20, y);
    y += 8;

    // Tabel informasi dasar
    const infoData = [
        ['Nomor Pemeriksaan', ':', `DX-${Date.now().toString().slice(-8)}`],
        ['Tanggal Pemeriksaan', ':', new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric'})],
        ['Nama Lengkap', ':', result.user.nama],
        ['Usia', ':', `${result.user.usia} tahun`],
        ['Jenis Kelamin', ':', result.user.jenis_kelamin],
        ['Alamat', ':', result.user.alamat],
    ];

    autoTable(doc, {
        startY: y,
        body: infoData,
        theme: 'plain',
        styles: { 
            fontSize: 10,
            cellPadding: 2,
            textColor: [40, 40, 40]
        },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 50, textColor: [60, 60, 60] },
            1: { cellWidth: 5 },
            2: { cellWidth: 'auto' }
        }
    });
    y = doc.lastAutoTable.finalY + 15;

    // Section 2: Hasil Pemeriksaan
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 58, 138);
    doc.text("II. HASIL PEMERIKSAAN", 20, y);
    y += 8;

    // Box hasil dengan styling minimal
    const resultBox = [
        ['Tingkat Kecanduan', ':', `${parseFloat((result.total_cf * 100).toFixed(2))}%`],
        ['Kategori', ':', result.kategori.toUpperCase()],
    ];

    autoTable(doc, {
        startY: y,
        body: resultBox,
        theme: 'plain',
        styles: { 
            fontSize: 10,
            cellPadding: 2,
            textColor: [40, 40, 40]
        },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 50, textColor: [60, 60, 60] },
            1: { cellWidth: 5 },
            2: { cellWidth: 'auto', fontStyle: 'bold', fontSize: 11 }
        }
    });
    y = doc.lastAutoTable.finalY + 15;

    // Section 3: Gejala Teridentifikasi
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 58, 138);
    doc.text("III. GEJALA TERIDENTIFIKASI", 20, y);
    y += 8;

    const symptomsData = result.gejala_terpilih.map((g, idx) => [
        idx + 1,
        g.gejala,
        `${(g.cf_user * 100).toFixed(0)}%`
    ]);

    autoTable(doc, {
        startY: y,
        head: [['No.', 'Deskripsi Gejala', 'Tingkat Keyakinan']],
        body: symptomsData,
        theme: 'plain',
        styles: {
            fontSize: 9,
            cellPadding: 3,
            lineColor: [220, 220, 220],
            lineWidth: 0.1,
            textColor: [40, 40, 40]
        },
        headStyles: { 
            fillColor: [248, 250, 252],
            textColor: [60, 60, 60],
            fontStyle: 'bold',
            halign: 'left'
        },
        columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 35, halign: 'center' }
        },
        alternateRowStyles: {
            fillColor: [252, 252, 252]
        }
    });
    y = doc.lastAutoTable.finalY + 15;
    
    // Cek apakah perlu halaman baru
    if (y > 220) {
        doc.addPage();
        addHeader();
        y = 50;
    }

    // Section 4: Rekomendasi dan Tindak Lanjut
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 58, 138);
    doc.text("IV. REKOMENDASI DAN TINDAK LANJUT", 20, y);
    y += 8;
    
    y = renderSlateContent(doc, result.solusi, y);
    
    // Tambah space sebelum penutup
    y += 15;
    
    // Cek halaman untuk penutup
    if (y > 240) {
        doc.addPage();
        addHeader();
        y = 50;
    }
    
    // Penutup profesional
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const closingText = [
        "Demikian hasil pemeriksaan ini dibuat dengan sebenar-benarnya berdasarkan data dan gejala",
        "yang telah disampaikan. Untuk konsultasi lebih lanjut, disarankan untuk berkonsultasi dengan",
        "tenaga profesional di bidang kesehatan mental."
    ];
    
    closingText.forEach((line, idx) => {
        doc.text(line, 20, y + (idx * 5));
    });
    
    y += 25;
    
    // Tanda tangan digital placeholder
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    doc.text("SIPIKAT - Sistem Pakar", pageWidth - 60, y, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("(Dokumen elektronik, tidak memerlukan tanda tangan basah)", pageWidth - 60, y + 5, { align: 'center' });
    
    // Tambahkan footer ke semua halaman
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        addFooter(i, pageCount);
    }

    // Simpan dengan nama file yang rapi
    const fileName = `Laporan_Diagnosa_${result.user.nama.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
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
                             className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 cursor-pointer transition-transform transform hover:scale-105"
                         >
                             <Download className="mr-2 h-5 w-5" />
                             Unduh Laporan PDF
                         </button>
                         <Link 
                             href="/diagnosa" 
                             className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-200 border border-gray-300  transition-transform transform hover:scale-105"
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