'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, List, Lightbulb, RefreshCw, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { parseAndRenderContent } from '@/app/(user)/artikel/[slug]/page';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 

const RadialProgress = ({ percentage, styles }) => {
    const radius = 80;
    const stroke = 15;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center">
            <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
                <circle
                    stroke="#e5e7eb"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <motion.circle
                    stroke={styles.progress}
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset }}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${styles.text}`}>
                    {percentage}%
                </span>
                <span className="text-sm text-black">Tingkat kecanduan</span>
            </div>
        </div>
    );
};

const InfoCard = ({ icon, title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full">
        <div className="flex items-center mb-4">
            {icon}
            <h3 className="text-lg font-semibold text-gray-800 ml-3">{title}</h3>
        </div>
        <div className="text-gray-600 space-y-2">
            {children}
        </div>
    </div>
);

export default function HasilPage() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

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
            return { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-400', progress: '#ef4444' };
        }
        if (lowerKategori.includes('waspada') || lowerKategori.includes('sedang')) {
            return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-400', progress: '#eab308' };
        }
        return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-400', progress: '#16a34a' };
    };
    
    const renderSlateContent = (doc, slateJSON, startY) => {
        let y = startY;
        const nodes = JSON.parse(slateJSON);
    
        const normalFontSize = 10;
        const textMargin = 10;
        const pageWrapWidth = doc.internal.pageSize.getWidth() - (textMargin * 2);
        const lineHeight = 5;
    
        nodes.forEach(node => {
            if (y > 280) {
                doc.addPage();
                y = 10;
            }
    
            if (node.type === 'paragraph') {
                let line = '';
                node.children.forEach(child => {
                     if (child.text) {
                         line += child.text;
                     }
                });
                const textLines = doc.splitTextToSize(line.trim(), pageWrapWidth);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(normalFontSize);
                doc.text(textLines, textMargin, y);
                y += textLines.length * lineHeight;
            } 
            
            else if (node.type === 'numbered-list') {
                let itemCounter = 1;
                node.children.forEach(listItem => {
                     if (y > 280) {
                         doc.addPage();
                         y = 10;
                     }
                    let line = '';
                    listItem.children.forEach(textPart => {
                        line += textPart.text || '';
                    });
    
                    const fullLine = `${itemCounter}. ${line.trim()}`;
                    const textLines = doc.splitTextToSize(fullLine, pageWrapWidth - 5);
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(normalFontSize);
                    doc.text(textLines, textMargin + 5, y);
                    y += textLines.length * lineHeight;
                    itemCounter++;
                });
                 y += lineHeight / 2;
            }
        });
    
        return y;
    };

    const handleDownload = () => {
        const doc = new jsPDF();
        let y = 10;

        // Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text("Hasil Diagnosa SIPIKAT", 105, y, { align: 'center' });
        y += 7;
        doc.text("(Sistem Pakar Identifikasi Tingkat Kecanduan Gadget)", 105, y, { align: 'center' });
        y += 10;

        // Date
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Tanggal: ${new Date().toLocaleDateString()}`, 200, y, { align: 'right' });
        y += 10;

        // Diagnosis Results Section
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("Hasil Diagnosa", 10, y);
        y += 7;
        doc.setFont('helvetica', 'normal');
        doc.text(`Kategori: ${result.kategori}`, 10, y);    
        y += 5;
        doc.text(`Tingkat Kecanduan: ${parseFloat((result.total_cf * 100).toFixed(2))}%`, 10, y);
        y += 10;

        // Solusi & Rekomendasi Section 
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text("Solusi & Rekomendasi", 10, y);
        y += 7;
        y = renderSlateContent(doc, result.solusi, y); 
        y += 5;

        // Detail Pasien Section 
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text("Detail Pasien", 10, y);
        y += 7;
        const patientData = [
            ['Nama', result.user.nama],
            ['Usia', `${result.user.usia} tahun`],
            ['Jenis Kelamin', result.user.jenis_kelamin],
            ['Alamat', result.user.alamat]
        ];
        autoTable(doc, {
            startY: y,
            body: patientData,
            theme: 'grid',
            columnStyles: {
                0: { cellWidth: 40 },
                1: { cellWidth: 'auto' }
            }
        });
        y = doc.lastAutoTable.finalY + 10;

        // Gejala yang Dialami Section
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text("Gejala yang Dialami", 10, y);
        y += 7;
        const symptomsData = result.gejala_terpilih.map((g, index) => [
            index + 1,
            g.gejala,
            `${(g.cf_user * 100).toFixed(0)}%`
        ]);
        autoTable(doc, {
            startY: y,
            head: [['No.', 'Gejala', 'Persentase']],
            body: symptomsData,
            theme: 'grid',
            headStyles: { 
                fillColor: [255, 255, 255], 
                textColor: [0, 0, 0],      
                lineWidth: 0.1,      
            },
            columnStyles: {
                0: { cellWidth: 10 },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 30 }
            }
        });

        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
        }

        doc.save("hasil_diagnosa.pdf");
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
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                className="max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="bg-white p-8 sm:p-10 rounded-xl shadow-lg border border-gray-200">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-4">Hasil Diagnosa Anda</h1>
                    <p className="text-center text-gray-500 mb-10">Berikut adalah hasil analisis sistem berdasarkan gejala yang Anda berikan.</p>

                    <div className="grid md:grid-cols-2 gap-8 items-center mb-10">
                        <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-gray-50 border">
                            <RadialProgress percentage={percentage} styles={styles} />
                            <div className={`mt-6 text-center ${styles.bg} ${styles.text} px-4 py-2 rounded-full font-semibold text-sm`}>
                                Kategori: {result.kategori}
                            </div>
                        </div>

                        <InfoCard icon={<Lightbulb className={`h-6 w-6 ${styles.text}`} />} title="Solusi & Rekomendasi">
                            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: parseAndRenderContent(result.solusi) }} />
                        </InfoCard>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <InfoCard icon={<User className="h-6 w-6 text-blue-600" />} title="Detail Pasien">
                            <p><strong>Nama:</strong> {result.user.nama}</p>
                            <p><strong>Usia:</strong> {result.user.usia} tahun</p>
                            <p><strong>Jenis Kelamin:</strong> {result.user.jenis_kelamin}</p>
                            <p><strong>Alamat:</strong> {result.user.alamat}</p>
                        </InfoCard>

                        <InfoCard icon={<List className="h-6 w-6 text-blue-600" />} title="Gejala yang Dialami">
                            <ul className="list-disc list-inside space-y-1">
                                {result.gejala_terpilih.map(g => (
                                    <li key={g.id}>
                                        {g.gejala} <span className="text-gray-500 text-sm">- ({(g.cf_user * 100).toFixed(0)}% yakin)</span>
                                    </li>
                                ))}
                            </ul>
                        </InfoCard>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:justify-center gap-4">
                            <button
                                onClick={handleDownload}
                                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-transform transform hover:scale-105"
                            >
                                <Download className="mr-2 h-5 w-5" />
                                Download Hasil
                            </button>
                            <Link 
                                href="/diagnosa" 
                                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105"
                            >
                                <RefreshCw className="mr-2 h-5 w-5" />
                                Lakukan Diagnosa Ulang
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}