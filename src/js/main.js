const init = () => {
    alert(hello('Bob', 'Tom'));
};

function hello(...args){
    return args.reduce((accu, curr,) => {
        return `Hello Helo! ${accu} ${curr}`;
    });
}

document.addEventListener('DOMContentLoaded', event => {
    init();
} );