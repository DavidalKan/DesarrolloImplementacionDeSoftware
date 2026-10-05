import { useState } from "react";
import CryptoJS from "crypto-js";
import "./Salt.css";

function Salt() {
    const [texto, setTexto] = useState("");
    const [textoCifrado, setTextoCifrado] = useState("");
    const [textoDescifrado, setTextoDescifrado] = useState("");

    const cifrar = (texto) => {
        const textoCifrado = CryptoJS.AES.encrypt(texto, "12345678").toString();
        return textoCifrado;
    }

    const descifrar = (texto) => {
        var bytes = CryptoJS.AES.decrypt(texto, '12345678');
        var textoDescifrado = bytes.toString(CryptoJS.enc.Utf8);
        return textoDescifrado;
    }

    return (
        <main className="cyber-app">
            <section className="cyber-panel">
                <p className="cyber-eyebrow">SECURE TEXT PROTOCOL // AES-256</p>
                <h1>Cyber<span>Vault</span></h1>
                <p className="cyber-subtitle">
                    Cifra y descifra tus mensajes dentro de un entorno seguro.
                </p>

                <label htmlFor="texto-secreto">Mensaje de entrada</label>
                <input
                    id="texto-secreto"
                    type="text"
                    value={texto}
                    onChange={(evento) => setTexto(evento.target.value)}
                    placeholder="Escribe el texto..."
                />

                <div className="cyber-actions">
                    <button
                        type="button"
                        className="cyber-button"
                        onClick={() => {
                            setTextoCifrado(cifrar(texto));
                            setTextoDescifrado("");
                        }}
                        disabled={!texto}
                    >
                        Cifrar
                    </button>
                    <button
                        type="button"
                        className="cyber-button cyber-button-secondary"
                        onClick={() => setTextoDescifrado(descifrar(textoCifrado))}
                        disabled={!textoCifrado}
                    >
                        Descifrar
                    </button>
                </div>

                <div className="cyber-output">
                    <div>
                        <span className="cyber-label">SALIDA CIFRADA</span>
                        <p className="cyber-value">{textoCifrado || "Esperando mensaje..."}</p>
                    </div>
                    <div>
                        <span className="cyber-label">TEXTO ORIGINAL</span>
                        <p className="cyber-value">{textoDescifrado || "Bloqueado hasta descifrar"}</p>
                    </div>
                </div>
            </section>
        </main>
    );
}


export default Salt;