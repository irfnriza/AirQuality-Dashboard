// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Modal functionality
    const modal = document.getElementById('modal');
    const modalChartContainer = document.getElementById('modal-chart-container');
    const closeModal = document.querySelector('.close-modal');
    
    // Toggle buttons functionality
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetChart = document.getElementById(targetId);
            
            // Clone the chart container and show in modal
            if (targetChart) {
                modal.style.display = 'flex';
                
                // Create a clone of the chart container
                const originalChartContainer = targetChart.cloneNode(true);
                originalChartContainer.style.height = '600px'; // Make chart bigger in modal
                
                // Clear previous chart and add the new one
                modalChartContainer.innerHTML = '';
                modalChartContainer.appendChild(originalChartContainer);
                
                // Re-render the chart in modal if needed
                // This depends on your charting library and implementation
                // You might need to call the chart rendering function again
                
                document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
            }
        });
    });
    
    // Close modal
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    });
    
    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('#main-nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 60, // Adjust for nav height
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Highlight active section in navigation
    const sections = document.querySelectorAll('.dashboard-section');
    
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= sectionTop && pageYOffset < sectionTop + sectionHeight) {
                current = '#' + section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === current) {
                link.classList.add('active');
            }
        });
    });
});