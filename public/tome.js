let totalPages = 0;

const handleGeneratePDF = async () => {
    const link = document.getElementById('presentation-link').value;
    const pages =document.getElementById('pages').value;

    const response = await fetch('/generate-pdf', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ link ,pages})
    });

    if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'complete-presentation.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } else {
        console.error('Error generating PDF:', response.statusText);
    }
};
