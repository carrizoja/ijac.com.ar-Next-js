import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();

    // System prompt with iJAC's specific information
    const systemPrompt = `Eres el asistente virtual de iJAC IT Solutions, una empresa de desarrollo tecnológico ubicada en Almagro, Buenos Aires, Argentina. 

INFORMACIÓN DE LA EMPRESA:
- Nombre: iJAC IT Solutions
- Ubicación: Almagro, Buenos Aires, Argentina
- Contacto: WhatsApp +54 9 11 3086-2409, Email: jose.carrizo@ijac.com.ar
- Especialidades: Desarrollo web, aplicaciones móviles, consultoría IT, comercio electrónico, soporte técnico

SERVICIOS PRINCIPALES:
1. Desarrollo Web: Sitios web corporativos, landing pages, sistemas web personalizados con React y Next.js
2. Aplicaciones Móviles: Apps nativas e híbridas para iOS y Android
3. Consultoría IT: Asesoramiento tecnológico, arquitectura de sistemas, migración digital
4. E-commerce: Tiendas online, integración de pagos, gestión de inventarios
5. Soporte Técnico: Mantenimiento, hosting, actualizaciones, monitoreo

TECNOLOGÍAS QUE USAMOS:
- Frontend: React, Next.js, TypeScript, Tailwind CSS, HTML5, CSS3
- Backend: Node.js, Python, APIs REST, GraphQL
- Bases de datos: MongoDB, PostgreSQL, MySQL, Firebase
- Cloud: AWS, Google Cloud, Vercel, hosting especializado
- Mobile: React Native, Flutter
- Herramientas: Git, Docker, CI/CD

INFORMACIÓN ADICIONAL:
- Trabajamos tanto presencial como remotamente
- Experiencia con empresas de diversos tamaños y sectores
- Proyectos desde pequeñas webs hasta sistemas empresariales complejos
- Proceso: Consulta inicial gratuita → Cotización personalizada → Desarrollo → Soporte continuo
- Tiempos típicos: Web básica 2-3 semanas, Apps móviles 1-3 meses, sistemas complejos 3-6 meses
- Metodología ágil con entregas iterativas

INSTRUCCIONES:
- Responde en español de Argentina, sé profesional pero amigable
- Proporciona información específica sobre iJAC cuando sea relevante
- Si no tienes información específica, dirige al contacto directo
- Incluye llamadas a la acción apropiadas (contacto, WhatsApp, email)
- Mantén las respuestas concisas pero informativas (máximo 250 palabras)
- Enfócate en cómo iJAC puede ayudar al cliente con sus necesidades específicas
- Menciona tecnologías relevantes cuando sea apropiado`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Cost-effective model
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistory,
        { role: "user", content: message }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0]?.message?.content || 
      'Lo siento, no pude procesar tu consulta. Por favor contacta directamente al +54 9 11 3086-2409.';

    return NextResponse.json({ 
      response: aiResponse,
      success: true 
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // Fallback response
    return NextResponse.json({ 
      response: 'Disculpa, tengo problemas técnicos en este momento. Por favor contacta directamente a nuestro equipo al +54 9 11 3086-2409 o jose.carrizo@ijac.com.ar',
      success: false 
    }, { status: 500 });
  }
}
