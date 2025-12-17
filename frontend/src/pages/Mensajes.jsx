import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getContactos, getConversacion, sendMensaje } from '../services/mensajesService';

const Mensajes = () => {
    const { user } = useAuth();
    
    // Estados
    const [contactos, setContactos] = useState([]);
    const [searchTerm, setSearchTerm] = useState(""); 
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loadingContacts, setLoadingContacts] = useState(false);
    
    const messagesEndRef = useRef(null);

    // Cargar Contactos (Solo una vez al inicio)
    useEffect(() => {
        const fetchContactos = async () => {
            setLoadingContacts(true);
            try {
                const data = await getContactos();
                setContactos(data);
            } catch (error) {
                console.error("Error cargando contactos:", error);
            } finally {
                setLoadingContacts(false);
            }
        };
        fetchContactos();
    }, []);

    //Actualzacion automática de mensajes cada 3 segundos
    useEffect(() => {
        if (!selectedUser) return;

        // Función para cargar mensajes
        const fetchChat = async (isAutoUpdate = false) => {
            try {
                const historial = await getConversacion(selectedUser._id);
                
                // Solo actualizamos si hay cambios para evitar parpadeos
                setMessages(prevMessages => {
                    // Si es la primera carga o hay más mensajes, actualizamos
                    if (historial.length !== prevMessages.length) {
                         // Solo scrollear abajo si hay mensajes nuevos
                        if (!isAutoUpdate || historial.length > prevMessages.length) {
                            scrollToBottom();
                        }
                        return historial;
                    }
                    return prevMessages;
                });
            } catch (error) {
                console.error("Error cargando chat:", error);
            }
        };

        // Carga inicial inmediata
        fetchChat();

        // Configurar el intervalo (pregunta cada 3 segundos)
        const intervalId = setInterval(() => {
            fetchChat(true); // true indica que es una actualización automática
        }, 3000);

        // Limpieza: detener el reloj si cambio de usuario o salgo
        return () => clearInterval(intervalId);

    }, [selectedUser]); // Se reinicia cada vez que cambias de usuario

    // Scroll al fondo
    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    // Enviar Mensaje
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        const contenido = newMessage;
        setNewMessage("");

        try {
            const msgEnviado = await sendMensaje({
                destinatario: selectedUser._id,
                contenido: contenido
            });
            
            // Forzamos la estructura correcta visualmente
            const msgVisual = { 
                ...msgEnviado, 
                // Aseguramos que remitente sea un objeto con _id para que coincida con la lógica
                remitente: { _id: user.id, nombre: user.nombre } 
            };
            
            setMessages(prev => [...prev, msgVisual]);
            scrollToBottom();
        } catch (error) {
            console.error("Error enviando mensaje:", error);
        }
    };

    const esMiMensaje = (msg) => {
        // Si el contexto de usuario aún no ha cargado, no puedo validar nada
        if (!user) return false;

        // Si el mensaje no tiene datos válidos
        if (!msg || !msg.remitente) return false;
        
        // Obtener el ID del remitente del mensaje (sea objeto o string)
        const remitenteId = msg.remitente._id 
            ? msg.remitente._id.toString() 
            : msg.remitente.toString();
            
        // Obtener MI ID de forma segura (probamos .id y ._id por si acaso)
        // El operador ?. evita el error si user es null, y el || "" evita el error de toString en undefined
        const miId = (user.id || user._id || "").toString();

        return remitenteId === miId;
    };

    // Filtro del buscador
    const filteredContactos = contactos.filter(c => 
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">💬 Mensajes</h1>
                    <p className="page-subtitle">Chat académico</p>
                </div>
            </div>

            <div className="mensajes-container" style={{ height: 'calc(100vh - 200px)' }}> 
                
                {/* SIDEBAR */}
                <div className="mensajes-sidebar">
                    <div className="mensajes-sidebar-header">
                        <div className="mensajes-sidebar-title">Contactos</div>
                        <input 
                            type="text" 
                            placeholder="Buscar contacto..." 
                            className="mensajes-search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="mensajes-list">
                        {loadingContacts ? (
                            <div style={{padding: 20, color: '#888'}}>Cargando...</div>
                        ) : filteredContactos.length > 0 ? (
                            filteredContactos.map(contacto => (
                                <div 
                                    key={contacto._id}
                                    className={`mensaje-item ${selectedUser?._id === contacto._id ? 'active' : ''}`}
                                    onClick={() => setSelectedUser(contacto)}
                                    style={{
                                        padding: '15px',
                                        borderBottom: '1px solid #f0f0f0',
                                        cursor: 'pointer',
                                        backgroundColor: selectedUser?._id === contacto._id ? '#f0f9ff' : 'transparent',
                                        display: 'flex', alignItems: 'center', gap: '10px'
                                    }}
                                >
                                    <div style={{
                                        width: 35, height: 35, borderRadius: '50%', 
                                        background: '#e2e8f0', color: '#475569',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                                    }}>
                                        {contacto.nombre.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{fontWeight: 600, fontSize: '0.95rem'}}>{contacto.nombre}</div>
                                        <div style={{fontSize: '0.8rem', color: '#94a3b8'}}>{contacto.rol}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{padding: 20, color: '#94a3b8', textAlign: 'center'}}>
                                No se encontraron contactos.
                            </div>
                        )}
                    </div>
                </div>
                
                {/* CHAT AREA */}
                <div className="mensajes-chat">
                    {selectedUser ? (
                        <>
                            <div className="chat-header" style={{padding: '15px', borderBottom: '1px solid #eee', fontWeight: 'bold', fontSize: '1.1rem'}}>
                                {selectedUser.nombre}
                            </div>

                            <div className="chat-messages" style={{flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px'}}>
                                {messages.map((msg, idx) => {
                                    // USAMOS LA NUEVA FUNCIÓN DE VERIFICACIÓN
                                    const esMio = esMiMensaje(msg);
                                    
                                    return (
                                        <div key={idx} style={{
                                            alignSelf: esMio ? 'flex-end' : 'flex-start',
                                            background: esMio ? '#3b82f6' : '#f1f5f9',
                                            color: esMio ? '#fff' : '#1e293b',
                                            padding: '8px 14px',
                                            borderRadius: '12px',
                                            maxWidth: '70%',
                                            fontSize: '0.95rem'
                                        }}>
                                            {msg.contenido}
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            <form onSubmit={handleSendMessage} style={{padding: '15px', borderTop: '1px solid #eee', display: 'flex', gap: '10px'}}>
                                <input 
                                    type="text" 
                                    placeholder="Escribe un mensaje..." 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    style={{flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ddd'}}
                                />
                                <button type="submit" style={{
                                    padding: '10px 20px', background: '#3b82f6', color: 'white', 
                                    border: 'none', borderRadius: '6px', cursor: 'pointer'
                                }}>
                                    Enviar
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="mensajes-empty-state">
                            <div className="mensajes-empty-icon" style={{fontSize: '3rem'}}>💬</div>
                            <div className="mensajes-empty-text" style={{color: '#94a3b8', marginTop: 10}}>Selecciona una conversación</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Mensajes;