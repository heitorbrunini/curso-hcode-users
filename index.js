

var fields =  document.querySelectorAll("#form-user-create [name]");
var user = { };

fields.forEach(
    function(field, index){
        if (field.name =="gender" && field.checked) {
            user[field.name] = field.ariaValueMax;
        } else{
            user[field.name] = field.ariaValueMax;
        }
    }
);