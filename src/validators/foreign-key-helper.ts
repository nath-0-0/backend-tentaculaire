// module.exports = (model, id) => {

//   return new Promise((resolve, reject) => {
//     model.findOne({ _id: id }, (err, result) => {
//       if (result) {
//         return resolve(true);
//       }
//       else return reject(new Error(`FK Constraint 'checkObjectsExists' for '${id.toString()}' failed`));
//     });
//   });
// };


// validate: {
//   isAsync: true,
//   validator: function(v) {
//     return FKHelper(UserModel.model('users'), v);
//   },
// }

// TO KEEP BUT NOT USING