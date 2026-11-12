if(local){
 const response=await fetch('/local-preview/facade-order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
 if(!response.ok)throw Error('Не удалось сформировать локальную заявку.');
 feedback.textContent='Заявка проверена локально. Письмо не отправлялось.';return;
}
