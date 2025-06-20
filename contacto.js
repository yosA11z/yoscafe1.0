document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    if (form) { 
        form.addEventListener('submit', async function(event) {
            event.preventDefault(); 

            formMessage.classList.remove('success', 'error'); 
            formMessage.textContent = 'Enviando mensaje...'; 

            
            const formData = new FormData(form);

            try {
                
                const response = await fetch(form.action, {
                    method: form.method, 
                    body: formData,      
                    headers: {
                        'Accept': 'application/json' 
                    }
                });

                
                const data = await response.json();

                if (response.ok) { 
                    formMessage.textContent = '¡Mensaje enviado con éxito! Te contactaremos pronto.';
                    formMessage.classList.add('success');
                    form.reset(); 
                } else {
                    
                    const errorMessage = data.errors && data.errors.length > 0
                                       ? data.errors.map(err => err.message).join(', ')
                                       : (data.message || 'Hubo un problema al enviar tu mensaje. Intenta de nuevo.');
                    
                    formMessage.textContent = `Error: ${errorMessage}`;
                    formMessage.classList.add('error');
                    console.error('Error de Formspree:', data); 
                }

            } catch (error) {
                
                console.error('Error de conexión o inesperado:', error);
                formMessage.textContent = '¡Oh no! Parece que hay un problema de conexión. Intenta de nuevo más tarde.';
                formMessage.classList.add('error');
            }
        });
    }
});