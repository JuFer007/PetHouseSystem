const ToastSystem = {
    container: null,

    init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 12px;
                pointer-events: none;
            `;
            document.body.appendChild(this.container);

            // Responsive
            if (window.innerWidth <= 640) {
                this.container.style.right = '10px';
                this.container.style.left = '10px';
                this.container.style.top = '10px';
            }
        }
    },

    config: {
        success: {
            bg: '#10b981',
            icon: 'fa-check-circle',
            progress: '#059669'
        },
        error: {
            bg: '#ef4444',
            icon: 'fa-times-circle',
            progress: '#dc2626'
        },
        warning: {
            bg: '#f59e0b',
            icon: 'fa-exclamation-triangle',
            progress: '#d97706'
        },
        info: {
            bg: '#06b6d4',
            icon: 'fa-info-circle',
            progress: '#0891b2'
        }
    },

    show(type, title, message, duration = 4000) {
        this.init();

        const config = this.config[type] || this.config.info;
        const toastId = 'toast-' + Date.now();

        const toast = document.createElement('div');
        toast.id = toastId;
        toast.style.cssText = `
            pointer-events: auto;
            min-width: 320px;
            max-width: 400px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
            overflow: hidden;
            transform: translateX(400px);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            position: relative;
        `;

        // Responsive width
        if (window.innerWidth <= 640) {
            toast.style.minWidth = 'auto';
            toast.style.maxWidth = '100%';
        }

        toast.innerHTML = `
            <div style="display: flex; align-items: start; gap: 12px; padding: 16px; position: relative;">
                <div style="width: 40px; height: 40px; background: ${config.bg}; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <i class="fas ${config.icon}" style="color: white; font-size: 18px;"></i>
                </div>

                <div style="flex: 1; min-width: 0;">
                    <h4 style="font-weight: 600; font-size: 15px; color: #1f2937; margin: 0 0 4px 0;">
                        ${title}
                    </h4>
                    <p style="font-size: 13px; color: #6b7280; margin: 0; line-height: 1.4;">
                        ${message}
                    </p>
                </div>

                <button onclick="ToastSystem.close('${toastId}')"
                        style="background: none; border: none; color: #9ca3af; cursor: pointer; padding: 4px; width: 24px; height: 24px; border-radius: 4px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s;"
                        onmouseover="this.style.background='#f3f4f6'; this.style.color='#1f2937';"
                        onmouseout="this.style.background='none'; this.style.color='#9ca3af';">
                    <i class="fas fa-times" style="font-size: 14px;"></i>
                </button>
            </div>

            <div style="position: absolute; bottom: 0; left: 0; height: 4px; background: ${config.progress}; width: 100%; transition: width ${duration}ms linear;"></div>
        `;

        this.container.appendChild(toast);

        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        }, 10);

        const progressBar = toast.querySelector('div[style*="position: absolute"]');
        setTimeout(() => {
            progressBar.style.width = '0%';
        }, 50);

        const timeoutId = setTimeout(() => {
            this.close(toastId);
        }, duration);

        toast.addEventListener('mouseenter', () => {
            clearTimeout(timeoutId);
            progressBar.style.transition = 'none';
        });

        toast.addEventListener('mouseleave', () => {
            const remaining = parseFloat(progressBar.style.width) / 100 * duration;
            progressBar.style.transition = `width ${remaining}ms linear`;
            progressBar.style.width = '0%';

            setTimeout(() => {
                this.close(toastId);
            }, remaining);
        });
    },

    close(toastId) {
        const toast = document.getElementById(toastId);
        if (toast) {
            toast.style.transform = 'translateX(400px)';
            toast.style.opacity = '0';

            setTimeout(() => {
                toast.remove();

                // Limpiar contenedor si está vacío
                if (this.container && this.container.children.length === 0) {
                    this.container.remove();
                    this.container = null;
                }
            }, 300);
        }
    }
};

//Función global simplificada
function showToast(type, title, message, duration = 4000) {
    ToastSystem.show(type, title, message, duration);
}

//Ajustar posición en resize
window.addEventListener('resize', () => {
    if (ToastSystem.container) {
        if (window.innerWidth <= 640) {
            ToastSystem.container.style.right = '10px';
            ToastSystem.container.style.left = '10px';
        } else {
            ToastSystem.container.style.right = '20px';
            ToastSystem.container.style.left = 'auto';
        }
    }
});
