import { QRCodeSVG } from 'qrcode.react';
import '../styles/QRSection.css';

const QRSection = () => {
    const productionUrl = "https://rutas-seguras-utm.vercel.app/";

    const downloadQR = () => {
        const svg = document.getElementById("qr-code-svg");
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = "Rutas-Seguras-QR.png";
            downloadLink.href = `${pngFile}`;
            downloadLink.click();
        };
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    return (
        <section className="qr-section">
            <div className="qr-card">
                <div className="qr-info">
                    <h2>¡Comparte el QR con otros estudiantes!</h2>
                    <p>Escanea el código para entrar al sistema sin descargar nada.</p>
                    <button onClick={downloadQR} className="qr-download-btn">
                        Descargar QR
                    </button>
                </div>
                <div className="qr-display">
                    <div className="qr-wrapper">
                        <QRCodeSVG
                            id="qr-code-svg"
                            value={productionUrl}
                            size={180}
                            level={"H"}
                            includeMargin={true}
                            imageSettings={{
                                src: "/favicon.ico", 
                                x: undefined,
                                y: undefined,
                                height: 40,
                                width: 40,
                                excavate: true,
                            }}
                        />
                    </div>
                    <span className="qr-url">rutas-seguras-utm.vercel.app</span>
                </div>
            </div>
        </section>
    );
};

export default QRSection;
