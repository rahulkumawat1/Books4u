const myCardInfo = document.querySelector('.my-card-info');
const paymentInput = document.querySelectorAll('input[name="paymentMethod"]');

paymentInput.forEach((elem) => {
    elem.addEventListener("change", function(event) {
      var item = event.target.value;
      if(item == 'credit'){
          myCardInfo.style.display = 'block';
      }
      else if(item == 'debit'){
          myCardInfo.style.display = 'block';
      }
      else {
          myCardInfo.style.display = 'none';
      }
    });
  });
