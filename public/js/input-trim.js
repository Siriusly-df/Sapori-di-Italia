document.addEventListener("DOMContentLoaded", function () {
    const inputs = document.querySelectorAll("input, textarea");

    inputs.forEach(input => {
      input.addEventListener("blur", function () { 
        this.value = this.value.trim();
      });
    });
  });