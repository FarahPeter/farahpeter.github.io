document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('nav ul li a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            window.scrollTo({
                top: targetSection.offsetTop - 50,
                behavior: 'smooth'
            });
        });
    });
});

 document.getElementById('download-portfolio').addEventListener('click', function () {
        var zip = new JSZip();
        
        // Add HTML file
        zip.file("index.html", document.documentElement.outerHTML);
        
        // Add CSS file
        JSZipUtils.getBinaryContent('styles.css', function (err, data) {
            if (err) {
                throw err; // or handle the error
            }
            zip.file("styles.css", data, { binary: true });

            // Add JavaScript file
            JSZipUtils.getBinaryContent('script.js', function (err, data) {
                if (err) {
                    throw err; // or handle the error
                }
                zip.file("script.js", data, { binary: true });

                // Generate the zip file
                zip.generateAsync({ type: "blob" })
                    .then(function (content) {
                        saveAs(content, "portfolio.zip");
                    });
            });
        });
    });
