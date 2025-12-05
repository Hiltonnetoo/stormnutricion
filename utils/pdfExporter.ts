import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { DietPlan, Meal, MealOption } from '../types';

function formatFileName(plan: DietPlan): string {
    const patientName = plan.patientName.replace(/\s+/g, '-').toLowerCase();
    const date = new Date(plan.createdAt).toLocaleDateString('pt-BR').replace(/\//g, '-');
    return `dieta-${patientName}-${date}.pdf`;
}

// --- MODO 1: LAYOUT CUSTOMIZADO ---
export const generateCustomLayoutPdf = async (plan: DietPlan) => {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    let yPos = 20;
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    const lineHeight = 5;

    const addFooter = () => {
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(
                'Gerado pelo Sistema Isanutri v5',
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            );
        }
    };
    
    const checkPageBreak = (spaceNeeded: number) => {
        if (yPos + spaceNeeded > pageHeight - margin - 10) { // -10 for footer margin
            doc.addPage();
            yPos = margin;
        }
    };

    // --- Título ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('PLANO NUTRICIONAL', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // --- Informações do Paciente ---
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Paciente: ${plan.patientName}`, margin, yPos);
    doc.text(`Data de Criação: ${new Date(plan.createdAt).toLocaleDateString('pt-BR')}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 10;
    doc.line(margin, yPos, pageWidth - margin, yPos); // Divider
    yPos += 10;

    // --- Informações Nutricionais ---
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMAÇÕES NUTRICIONAIS', margin, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`- Calorias Totais: ${plan.dailyCalories.toFixed(0)} kcal`, margin + 5, yPos);
    yPos += lineHeight;
    doc.text(`- Proteínas: ${plan.macronutrients.proteinGrams.toFixed(0)}g (${plan.macronutrients.proteinPercentage}%)`, margin + 5, yPos);
    yPos += lineHeight;
    doc.text(`- Carboidratos: ${plan.macronutrients.carbsGrams.toFixed(0)}g (${plan.macronutrients.carbsPercentage}%)`, margin + 5, yPos);
    yPos += lineHeight;
    doc.text(`- Gorduras: ${plan.macronutrients.fatGrams.toFixed(0)}g (${plan.macronutrients.fatPercentage}%)`, margin + 5, yPos);
    yPos += 12;

    // --- Refeições ---
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PLANO DE REFEIÇÕES', margin, yPos);
    yPos += 8;

    plan.meals.forEach((meal: Meal) => {
        const mealText = [
            `Opção Principal: ${meal.mainOption.name} - ${meal.mainOption.portion}`,
            ...meal.alternatives.map((alt: MealOption) => `Alternativa: ${alt.name} - ${alt.portion}`)
        ];
        const mealBlockHeight = 20 + mealText.length * lineHeight; // Estimate height
        checkPageBreak(mealBlockHeight);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${meal.mealName} (${meal.time})`, margin, yPos);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100);
        doc.text(`Aprox. ${meal.calories.toFixed(0)} kcal`, pageWidth - margin, yPos, { align: 'right' });
        yPos += 6;
        
        doc.setTextColor(0);
        doc.setFont('helvetica', 'normal');
        
        const mainOptionText = doc.splitTextToSize(`Opção Principal: ${meal.mainOption.name} - ${meal.mainOption.portion}`, contentWidth - 5);
        doc.text(mainOptionText, margin + 5, yPos);
        yPos += mainOptionText.length * lineHeight;
        
        yPos += 2;
        doc.setFont('helvetica', 'italic');
        doc.text('Alternativas:', margin + 5, yPos);
        yPos += lineHeight;
        doc.setFont('helvetica', 'normal');
        meal.alternatives.forEach((alt: MealOption) => {
            const altText = doc.splitTextToSize(`- ${alt.name} - ${alt.portion}`, contentWidth - 10);
            checkPageBreak(altText.length * lineHeight + 5);
            doc.text(altText, margin + 10, yPos);
            yPos += altText.length * lineHeight;
        });

        yPos += 8; // Space between meals
    });

    // --- Rodapé ---
    addFooter();

    doc.save(formatFileName(plan));
};


// --- MODO 2: CAPTURA DE TELA ---
export const generateScreenshotPdf = async (element: HTMLElement, plan: DietPlan) => {
    try {
        const canvas = await html2canvas(element, { 
            scale: 2, 
            useCORS: true,
            logging: false,
            backgroundColor: window.getComputedStyle(document.body).backgroundColor // Match dark/light mode
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        const ratio = canvasWidth / pdfWidth;
        const imgHeight = canvasHeight / ratio;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;
        }

        pdf.save(formatFileName(plan));

    } catch (error) {
        console.error("Error generating screenshot PDF:", error);
        throw error;
    }
};