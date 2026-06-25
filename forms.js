export function initForms() {
    // Lógica del Formulario de Contacto (Formspree AJAX)
    const contactForm = document.getElementById('contact-form');
    const formSuccessMsg = document.getElementById('form-success-msg');

    if (contactForm && formSuccessMsg) {
        // Validaciones en tiempo real
        const inputs = {
            name: document.getElementById('name'),
            email: document.getElementById('email'),
            subject: document.getElementById('subject'),
            message: document.getElementById('message')
        };

        const defaultClasses = ['border-gray-200', 'dark:border-brand-dark', 'focus:border-accent', 'focus:ring-accent'];
        const validClasses = ['border-green-500', 'focus:border-green-500', 'focus:ring-green-500', 'dark:border-green-500'];
        const invalidClasses = ['border-red-500', 'focus:border-red-500', 'focus:ring-red-500', 'dark:border-red-500'];

        const validateField = (field, regex, errorId, forceError = false) => {
            const el = inputs[field];
            if (!el) return false;
            const errorEl = document.getElementById(errorId);
            const isValid = regex.test(el.value.trim());

            el.classList.remove(...defaultClasses, ...validClasses, ...invalidClasses);

            if (el.value.trim() === '' && !forceError) {
                el.classList.add(...defaultClasses);
                if (errorEl) errorEl.classList.add('hidden');
                return false;
            } else if (isValid) {
                el.classList.add(...validClasses);
                if (errorEl) errorEl.classList.add('hidden');
                return true;
            } else {
                el.classList.add(...invalidClasses);
                if (errorEl) errorEl.classList.remove('hidden');
                return false;
            }
        };

        const validators = {
            name: (force = false) => validateField('name', /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{3,}$/, 'name-error', force),
            email: (force = false) => validateField('email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'email-error', force),
            subject: (force = false) => validateField('subject', /^.{3,}$/, 'subject-error', force),
            message: (force = false) => validateField('message', /^[\s\S]{10,}$/, 'message-error', force)
        };

        // Lógica del contador de caracteres para el mensaje
        const messageCounter = document.getElementById('message-counter');
        if (inputs.message && messageCounter) {
            const maxLength = inputs.message.getAttribute('maxlength') || 500;
            
            inputs.message.addEventListener('input', () => {
                const remaining = maxLength - inputs.message.value.length;
                messageCounter.textContent = `${remaining} caracteres restantes`;
                if (remaining <= 50) {
                    messageCounter.classList.add('text-red-600', 'dark:text-red-400');
                    messageCounter.classList.remove('text-gray-500', 'dark:text-gray-400');
                } else {
                    messageCounter.classList.remove('text-red-600', 'dark:text-red-400');
                    messageCounter.classList.add('text-gray-500', 'dark:text-gray-400');
                }
            });

            const savedMessage = sessionStorage.getItem('draft-message');
            if (savedMessage) {
                inputs.message.value = savedMessage;
                inputs.message.dispatchEvent(new Event('input'));
            }
            
            inputs.message.addEventListener('input', (e) => {
                sessionStorage.setItem('draft-message', e.target.value);
            });
        }

        Object.keys(inputs).forEach(key => {
            if (inputs[key]) {
                inputs[key].addEventListener('input', () => validatorskey);
                inputs[key].addEventListener('blur', () => validatorskey);
            }
        });

        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const isNameValid = validators.name(true);
            const isEmailValid = validators.email(true);
            const isSubjectValid = validators.subject(true);
            const isMessageValid = validators.message(true);

            if (!isNameValid || !isEmailValid || !isSubjectValid || !isMessageValid) {
                const firstInvalid = Object.keys(inputs).find(key => !validatorskey);
                if (inputs[firstInvalid]) inputs[firstInvalid].focus();
                return;
            }

            const form = e.target;
            const data = new FormData(form);
            const button = form.querySelector('button[type="submit"]');
            const originalBtnText = button.innerHTML;
            
            button.innerHTML = 'Enviando... <i class="fa-solid fa-spinner fa-spin"></i>';
            button.disabled = true;
            button.classList.add('opacity-75', 'cursor-not-allowed');

            try {
                const response = await fetch(form.action, { method: form.method, body: data, headers: { 'Accept': 'application/json' } });
                if (response.ok) {
                    form.reset();
                    form.classList.add('hidden');
                    formSuccessMsg.classList.remove('hidden');
                    formSuccessMsg.classList.add('flex');
                    sessionStorage.removeItem('draft-message');
                } else {
                    alert('Hubo un problema al enviar el mensaje. Por favor, inténtalo de nuevo.');
                    button.innerHTML = originalBtnText;
                    button.disabled = false;
                    button.classList.remove('opacity-75', 'cursor-not-allowed');
                }
            } catch (error) {
                alert('Error de conexión. Por favor, revisa tu internet y vuelve a intentarlo.');
                button.innerHTML = originalBtnText;
                button.disabled = false;
                button.classList.remove('opacity-75', 'cursor-not-allowed');
            }
        });
    }

    // Lógica del Formulario de Newsletter (Formspree AJAX)
    const newsletterForm = document.getElementById('newsletter-form');
    const newsletterSuccessMsg = document.getElementById('newsletter-success-msg');

    if (newsletterForm && newsletterSuccessMsg) {
        const newsletterEmail = document.getElementById('newsletter-email');
        const newsletterEmailError = document.getElementById('newsletter-email-error');
        
        const nlDefaultClasses = ['border-brand-muted/30', 'focus:border-accent', 'focus:ring-accent'];
        const nlValidClasses = ['border-green-500', 'focus:border-green-500', 'focus:ring-green-500'];
        const nlInvalidClasses = ['border-red-500', 'focus:border-red-500', 'focus:ring-red-500'];

        const validateNewsletterEmail = (forceError = false) => {
            if (!newsletterEmail) return false;
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const isValid = regex.test(newsletterEmail.value.trim());

            newsletterEmail.classList.remove(...nlDefaultClasses, ...nlValidClasses, ...nlInvalidClasses);

            if (newsletterEmail.value.trim() === '' && !forceError) {
                newsletterEmail.classList.add(...nlDefaultClasses);
                if (newsletterEmailError) newsletterEmailError.classList.add('hidden');
                return false;
            } else if (isValid) {
                newsletterEmail.classList.add(...nlValidClasses);
                if (newsletterEmailError) newsletterEmailError.classList.add('hidden');
                return true;
            } else {
                newsletterEmail.classList.add(...nlInvalidClasses);
                if (newsletterEmailError) newsletterEmailError.classList.remove('hidden');
                return false;
            }
        };

        if (newsletterEmail) {
            newsletterEmail.addEventListener('input', () => validateNewsletterEmail());
            newsletterEmail.addEventListener('blur', () => validateNewsletterEmail());
        }

        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const isEmailValid = validateNewsletterEmail(true);
            if (!isEmailValid) { if (newsletterEmail) newsletterEmail.focus(); return; }
            const form = e.target;
            const data = new FormData(form);
            const button = form.querySelector('button[type="submit"]');
            const originalBtnText = button.innerHTML;
            button.innerHTML = 'Enviando... <i class="fa-solid fa-spinner fa-spin ml-2"></i>';
            button.disabled = true;
            button.classList.add('opacity-75', 'cursor-not-allowed');
            try {
                const response = await fetch(form.action, { method: form.method, body: data, headers: { 'Accept': 'application/json' } });
                if (response.ok) {
                    form.reset();
                    form.classList.add('hidden');
                    newsletterSuccessMsg.classList.remove('hidden');
                    newsletterSuccessMsg.classList.add('inline-flex');
                } else {
                    alert('Hubo un problema al procesar tu suscripción.');
                    button.innerHTML = originalBtnText;
                    button.disabled = false;
                    button.classList.remove('opacity-75', 'cursor-not-allowed');
                }
            } catch (error) {
                alert('Error de conexión. Por favor, revisa tu internet y vuelve a intentarlo.');
                button.innerHTML = originalBtnText;
                button.disabled = false;
                button.classList.remove('opacity-75', 'cursor-not-allowed');
            }
        });
    }

    // Lógica del Formulario Pop-up de Newsletter
    const popupNewsletterForm = document.getElementById('popup-newsletter-form');
    const popupNewsletterSuccessMsg = document.getElementById('popup-newsletter-success-msg');

    if (popupNewsletterForm && popupNewsletterSuccessMsg) {
        const popupEmail = document.getElementById('popup-newsletter-email');
        const popupEmailError = document.getElementById('popup-newsletter-email-error');
        
        const validatePopupEmail = (forceError = false) => {
            if (!popupEmail) return false;
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const isValid = regex.test(popupEmail.value.trim());

            popupEmail.classList.remove('border-gray-200', 'dark:border-gray-700', 'border-green-500', 'border-red-500');

            if (popupEmail.value.trim() === '' && !forceError) {
                popupEmail.classList.add('border-gray-200', 'dark:border-gray-700');
                if (popupEmailError) popupEmailError.classList.add('hidden');
                return false;
            } else if (isValid) {
                popupEmail.classList.add('border-green-500');
                if (popupEmailError) popupEmailError.classList.add('hidden');
                return true;
            } else {
                popupEmail.classList.add('border-red-500');
                if (popupEmailError) popupEmailError.classList.remove('hidden');
                return false;
            }
        };

        if (popupEmail) {
            popupEmail.addEventListener('input', () => validatePopupEmail());
            popupEmail.addEventListener('blur', () => validatePopupEmail());
        }

        popupNewsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const isEmailValid = validatePopupEmail(true);
            if (!isEmailValid) { if (popupEmail) popupEmail.focus(); return; }
            
            const form = e.target;
            const data = new FormData(form);
            const button = form.querySelector('button[type="submit"]');
            const originalBtnText = button.innerHTML;
            
            button.innerHTML = 'Enviando... <i class="fa-solid fa-spinner fa-spin ml-2"></i>';
            button.disabled = true;
            button.classList.add('opacity-75', 'cursor-not-allowed');
            
            try {
                const response = await fetch(form.action, { method: form.method, body: data, headers: { 'Accept': 'application/json' } });
                if (response.ok) {
                    form.classList.add('hidden');
                    popupNewsletterSuccessMsg.classList.remove('hidden');
                    popupNewsletterSuccessMsg.classList.add('flex');
                    
                    // Cerrar el popup automáticamente 3 segundos después del éxito
                    setTimeout(() => {
                        const closeBtn = document.getElementById('close-newsletter-popup');
                        if (closeBtn) closeBtn.click();
                    }, 3000);
                } else {
                    alert('Hubo un problema al procesar tu suscripción.');
                    button.innerHTML = originalBtnText;
                    button.disabled = false;
                    button.classList.remove('opacity-75', 'cursor-not-allowed');
                }
            } catch (error) {
                alert('Error de conexión. Por favor, revisa tu internet y vuelve a intentarlo.');
                button.innerHTML = originalBtnText;
                button.disabled = false;
                button.classList.remove('opacity-75', 'cursor-not-allowed');
            }
        });
    }
}