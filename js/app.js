import '../css/main.css';

var test = {a: 1, b:2};

var {a, b} = test;

console.log(a);

/**
 * 很关键  代码热替换
 */
if(module.hot){
  module.hot.accept();
}
