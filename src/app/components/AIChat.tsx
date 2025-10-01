'use client'

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '¡Hola! Soy el asistente virtual de iJAC IT Solutions. Estoy aquí para ayudarte con cualquier consulta sobre nuestros servicios. ¿En qué puedo ayudarte hoy?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Enhanced AI-like responses (no API needed)
  const getAIResponse = async (userMessage: string): Promise<string> => {
    const message = userMessage.toLowerCase();
    
    // Servicios
    if (message.includes('servicio') || message.includes('qué hacen') || message.includes('que hacen')) {
      return 'En iJAC IT Solutions ofrecemos varios servicios:\n\n🌐 **Desarrollo Web**: Sitios corporativos, landing pages, sistemas web\n📱 **Aplicaciones Móviles**: Apps para iOS y Android\n💻 **Consultoría IT**: Asesoramiento tecnológico y arquitectura\n🛒 **E-commerce**: Tiendas online completas\n🔧 **Soporte Técnico**: Mantenimiento Mac y PC\n\n¿Te interesa algún servicio en particular?';
    }
    
    // Precios
    if (message.includes('precio') || message.includes('costo') || message.includes('cotizar') || message.includes('cuanto cuesta')) {
      return 'Los precios varían según el proyecto:\n\n💰 **Sitio Web Básico**: Desde $150.000 ARS\n💰 **Sitio Web Avanzado**: $300.000 - $600.000 ARS\n💰 **App Móvil**: Desde $400.000 ARS\n💰 **E-commerce**: Desde $250.000 ARS\n\nPara una cotización personalizada, contáctanos al +54 9 11 3086-2409. ¡La consulta inicial es gratuita!';
    }
    
    // Contacto
    if (message.includes('contacto') || message.includes('teléfono') || message.includes('whatsapp') || message.includes('como los contacto')) {
      return '📞 **Contacto iJAC IT Solutions**:\n\n📱 WhatsApp: +54 9 11 3086-2409\n📧 Email: jose.carrizo@ijac.com.ar\n📍 Ubicación: Almagro, Buenos Aires\n\n¿Prefieres que te contactemos nosotros? ¡Envíanos un mensaje por WhatsApp!';
    }
    
    // Tecnologías
    if (message.includes('tecnologia') || message.includes('react') || message.includes('next') || message.includes('que usan')) {
      return '⚡ **Tecnologías que utilizamos**:\n\n🎨 **Frontend**: React, Next.js, TypeScript, Tailwind CSS\n⚙️ **Backend**: Node.js, Python, APIs REST\n💾 **Bases de datos**: MongoDB, PostgreSQL, MySQL\n☁️ **Cloud**: AWS, Google Cloud, hosting especializado\n📱 **Móvil**: React Native, Flutter\n\n¿Hay alguna tecnología específica que te interese?';
    }
    
    // Tiempo
    if (message.includes('tiempo') || message.includes('cuanto tarda') || message.includes('duración') || message.includes('cuando estaria')) {
      return '⏱️ **Tiempos de desarrollo aproximados**:\n\n🚀 **Landing Page**: 1-2 semanas\n🌐 **Sitio Web Corporativo**: 3-4 semanas\n🛒 **E-commerce**: 4-6 semanas\n📱 **App Móvil**: 8-12 semanas\n⚙️ **Sistema Personalizado**: 2-4 meses\n\nLos tiempos pueden variar según la complejidad. ¿Qué tipo de proyecto tienes en mente?';
    }
    
    // Apps móviles
    if (message.includes('app') || message.includes('móvil') || message.includes('movil') || message.includes('aplicación')) {
      return '📱 **Desarrollo de Aplicaciones Móviles**:\n\n✅ Apps nativas para iOS y Android\n✅ Apps híbridas con React Native\n✅ Diseño UX/UI profesional\n✅ Integración con APIs y bases de datos\n✅ Publicación en App Store y Google Play\n✅ Mantenimiento y actualizaciones\n\n¿Tienes una idea específica para tu app?';
    }
    
    // E-commerce
    if (message.includes('tienda') || message.includes('ecommerce') || message.includes('e-commerce') || message.includes('venta online')) {
      return '🛒 **Soluciones E-commerce**:\n\n💳 Integración con MercadoPago, Stripe, PayPal\n📦 Gestión de inventarios y productos\n🚚 Integración con sistemas de envío\n📊 Panel de administración completo\n📱 Diseño responsive y mobile-first\n🔒 Seguridad SSL y protección de datos\n\n¿Qué tipo de productos planeas vender?';
    }
    
    // Saludos
    if (message.includes('hola') || message.includes('buenos días') || message.includes('buenas tardes') || message.includes('buenas noches')) {
      return '¡Hola! 👋 Me alegra que te pongas en contacto con iJAC IT Solutions.\n\nSomos especialistas en:\n• Desarrollo web y aplicaciones móviles\n• Consultoría tecnológica\n• Soporte técnico especializado\n\n¿En qué podemos ayudarte hoy?';
    }
    
    // WordPress
    if (message.includes('wordpress') || message.includes('wp')) {
      return '🔧 **WordPress y CMS**:\n\nTrabajamos con:\n✅ WordPress personalizado\n✅ Temas y plugins a medida\n✅ Optimización de rendimiento\n✅ Seguridad y mantenimiento\n✅ Migración de sitios\n\nTambién desarrollamos con tecnologías más modernas como React y Next.js. ¿Qué prefieres?';
    }
    
    // Soporte
    if (message.includes('soporte') || message.includes('mantenimiento') || message.includes('actualizar')) {
      return '🛠️ **Soporte Técnico**:\n\n🔄 Actualizaciones regulares\n🔒 Backups automáticos\n⚡ Optimización de rendimiento\n🛡️ Monitoreo de seguridad\n📞 lunes a viernes de 9 a 18h\n💻 Soporte Mac y PC\n\n¿Necesitas soporte para un sitio existente o planeas un proyecto nuevo?';
    }
    
    // Servicio técnico Apple
    if (message.includes('apple') || message.includes('mac') || message.includes('iphone') || message.includes('ipad') || message.includes('servicio técnico de productos apple')) {
      return '🍎 **Servicio Técnico Apple**:\n\n✅ Reparación Mac (MacBook, iMac, Mac Mini)\n✅ Diagnóstico y solución de problemas\n✅ Actualización de hardware y software\n✅ Recuperación de datos\n✅ Instalación de sistemas operativos\n✅ Mantenimiento preventivo\n\n¡Somos especialistas en productos Apple! Contáctanos al +54 9 11 3086-2409.';
    }
    
    // Horario de atención
    if (message.includes('horario') || message.includes('hora') || message.includes('atención') || message.includes('cuál es el horario')) {
      return '🕐 **Horario de Atención**:\n\n📅 **Lunes a Viernes**: 9:00 - 18:00 hs\n📅 **Sábados**: 9:00 - 13:00 hs\n📅 **Domingos**: Solo emergencias\n\n📞 **WhatsApp 24/7**: +54 9 11 3086-2409\n📧 **Email**: jose.carrizo@ijac.com.ar\n\n¡Siempre estamos disponibles para urgencias!';
    }
    
    // Asistencias remotas
    if (message.includes('remota') || message.includes('remotas') || message.includes('distancia') || message.includes('asistencias remotas')) {
      return '💻 **Asistencias Remotas**:\n\n✅ Soporte técnico a distancia\n✅ Instalación de software\n✅ Configuración de sistemas\n✅ Resolución de problemas\n✅ Mantenimiento preventivo\n✅ Capacitación de usuarios\n\n🌍 **Atendemos todo el país**\n💰 **Consulta inicial gratuita**\n\n¿Necesitas ayuda remota ahora?';
    }

    // Ubicación
    if (message.includes('ubicación') || message.includes('dónde están') || message.includes('dónde se encuentran')) {
      return '📍 **Ubicación**:\n\nEstamos ubicados en:\n**Almagro, Ciudad de Buenos Aires**';
    }

    // Armado de PC
    if (message.includes('armado de pc') || message.includes('arman') || message.includes('pc gamer')|| message.includes('computadora a medida')) {
      return '🖥️ **Armado de PC**:\n\n✅ Componentes de alta calidad\n✅ Ensamblaje personalizado\n✅ Pruebas de rendimiento\n✅ Garantía de satisfacción\n\n¿Tienes en mente alguna configuración específica o necesitas asesoramiento?';
    }

    // presupuesto sin cargo
    if (message.includes('presupuesto') || message.includes('cotización')) {
      return '💰 **Presupuesto Sin Cargo**:\n\n✅ Evaluación de necesidades\n✅ Propuesta personalizada\n✅ Sin compromiso\n\nContactanos para obtener tu presupuesto gratuito.';
    }

    // wifi y lan
    if (message.includes('wifi') || message.includes('lan') || message.includes('redes') || message.includes('cableado') || message.includes('router')) {
      return '🌐 **Instalación de WiFi y LAN**:\n\n✅ Configuración de redes inalámbricas\n✅ Instalación de puntos de acceso\n✅ Solución de problemas de conectividad\n✅ Optimización de señal\n\n¿Necesitas ayuda con tu red actual o estás planeando una nueva instalación?';
    }

    // Default response con más opciones
    return '¡Excelente pregunta! 🤔\n\nPara darte la información más precisa, te recomiendo:\n\n📱 **WhatsApp**: +54 9 11 3086-2409 (respuesta inmediata)\n📧 **Email**: jose.carrizo@ijac.com.ar\n\nTambién puedes preguntarme sobre:\n• Servicios\n• Tecnologías\n• Tiempos de desarrollo\n\n¿Hay algo específico que te gustaría saber?';
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsTyping(true);

    // Simulate realistic AI thinking time
    setTimeout(async () => {
      try {
        const aiResponse = await getAIResponse(currentInput);
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: aiResponse,
          isUser: false,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
      } catch (error) {
        console.error('Error getting AI response:', error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Disculpa, tengo problemas técnicos en este momento. Por favor contacta directamente al +54 9 11 3086-2409.',
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    }, 1000 + Math.random() * 1000); // Random delay for realism
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "¿Qué servicios ofrecen?",
    "¿Dónde se encuentran?",
    "¿Hacen servicio técnico de productos Apple?",
    "¿Cuál es el horario de atención?",
    "¿Cómo los contacto?"
  ];

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full shadow-lg hover:shadow-xl flex items-center justify-center z-[1000] transition-all duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          zIndex: 1000
        }}
                aria-label="Abrir chat de asistente virtual"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.svg
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              className="w-6 h-6 sm:w-7 sm:h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </motion.svg>
          ) : (
             <motion.svg
              key="chatbot"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              className="w-10 h-10 sm:w-11 sm:h-11 text-white"
              viewBox="-1.6 -1.6 19.20 19.20"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="0.00016"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" stroke="#CCCCCC" strokeWidth="0.032"></g>
              <g id="SVGRepo_iconCarrier">
                <path fillRule="evenodd" clipRule="evenodd" d="M8.48 4h4l.5.5v2.03h.52l.5.5V8l-.5.5h-.52v3l-.5.5H9.36l-2.5 2.76L6 14.4V12H3.5l-.5-.64V8.5h-.5L2 8v-.97l.5-.5H3V4.36L3.53 4h4V2.86A1 1 0 0 1 7 2a1 1 0 0 1 2 0 1 1 0 0 1-.52.83V4zM12 8V5H4v5.86l2.5.14H7v2.19l1.8-2.04.35-.15H12V8zm-2.12.51a2.71 2.71 0 0 1-1.37.74v-.01a2.71 2.71 0 0 1-2.42-.74l-.7.71c.34.34.745.608 1.19.79.45.188.932.286 1.42.29a3.7 3.7 0 0 0 2.58-1.07l-.7-.71zM6.49 6.5h-1v1h1v-1zm3 0h1v1h-1v-1z"></path>
              </g>
            </motion.svg>
          )}
        </AnimatePresence>

        {/* Notification Dot */}
        {!isOpen && (
          <motion.div
            className="absolute -top-0.25 -right-0.25 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-full h-full bg-red-400 rounded-full animate-ping"></div>
          </motion.div>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 w-80 sm:w-96 h-96 bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[999] flex flex-col overflow-hidden"
          >
            {/* Header */}
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center relative">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z"/>
                  </svg>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold">iJAC Ai Assistant</h3>
                  <p className="text-sm opacity-90">Asistente Inteligente</p>
                </div>
              </div>
            </div>            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    message.isUser 
                      ? 'bg-blue-500 text-white rounded-br-none' 
                      : 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white rounded-bl-none'
                  }`}>
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString('es-AR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 dark:bg-neutral-800 p-3 rounded-lg rounded-bl-none">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length === 1 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preguntas frecuentes:</p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInputText(question);
                        setTimeout(() => handleSendMessage(), 100);
                      }}
                      className="text-xs bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 px-2 py-1 rounded-full transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu pregunta..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-800 dark:text-white text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isTyping}
                  className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
