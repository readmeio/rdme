exports.swagger = false;
exports.login = false;
//exports.category = "basic";
//exports.desc = "Learn what you can do with oas";
exports.weight = 2;

exports.run = function(config, info) {
  console.log('Welcome to the OpenAPI/Swagger uploader for ReadMe!');
  console.log('');
  console.log('Have a Swagger file? ' + `${config.cli} swagger swagger.json --token=[token]`.yellow);
  console.log('Need a Swagger file? ' + `${config.cli} init`.yellow);
  process.exit();
};
