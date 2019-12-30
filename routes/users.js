var express = require('express');
var router = express.Router();
var fs = require('fs')
var path = require('path')

var distance = require('../utils/distance')

/* GET users listing. */
router.get('/users', function (req, res, next) {
	res.send('respond with a resource');
});

router.get('/', function (req, res, next) {

	var outputCustomers = readCustomers()	
							.then((cust_from_file) => {

								let customers_data = {},
									customers_temp = [];

								customers_data = cust_from_file.replace(/\r\n/g, ',').replace(/\\/g, '');
								customers_temp = JSON.parse('[' + customers_data + ']')
								// console.log("Customer array: \n" + JSON.stringify(customers_temp, null, 2))
								return checkIfWithinRadius(customers_temp);
							})
							.then((cust_within_rad) => {
								// console.log("Customers within 100km radius: " + JSON.stringify(cust_within_rad, null, 2))
								return sortCustomers(cust_within_rad)
							})
							.then((cust_sorted) => {
								// console.log("Customers Sorted within 100km radius: " + JSON.stringify(cust_sorted, null, 2))
								// let cust_sort_final_json = {},
								let cust_sort_final_arr = [];

									cust_sorted.forEach((customer) => {
										let cust_sort_final_json = {};
										cust_sort_final_json.user_id = customer.user_id;
										cust_sort_final_json.name = customer.name;
										console.log(cust_sort_final_json.name)
										cust_sort_final_arr.push(cust_sort_final_json)
									})

								console.log("Customers Sorted Final within 100km radius: " + JSON.stringify(cust_sort_final_arr, null, 2))
								res.header("Content-Type",'application/json');
								// res.send({'Customers within 100km of Dublin' : cust_sort_final_arr});

        						res.send(JSON.stringify(cust_sort_final_arr, null, 2));
							})
							.catch(err => {
								console.error(err);
							});

	function readCustomers(){
		return new Promise((resolve, reject) => {
			fs.readFile(path.join(__dirname, '../public/Customers.txt'), 'utf8', function readFileCallback(err, data) {
				if (err) {
					console.log("Error Reading customers from file: " + err);
					return reject(err)
				}
				else {
					resolve(data)
				}
				// console.log("Customer array: \n" + JSON.stringify(customers_temp, null, 2))
				// return customers_temp
			})
		})
	}

	function checkIfWithinRadius(customers_arr){
		return new Promise((resolve, reject) => {
			let cust_within_radius = [],
				source = {},
				destination = {								// Dublin coordinates to calculate distance from, proviided in the quuestion 
					"lat" : 53.339428, 
					"lon" : -6.257664
				},
				dist;
			// console.log("Customer array: \n" + JSON.stringify(customers_arr, null, 2))

			customers_arr.forEach((customer) => {
				source.lat = customer.latitude;
				source.lon = customer.longitude;
				dist = distance.calculateDistance(source, destination);
				console.log(`distance for customer : ${dist}`);
				if(dist < 100) cust_within_radius.push(customer)
			});
			resolve(cust_within_radius);
			// console.log("Customers within 100km radius: " + JSON.stringify(cust_within_radius, null, 2))
		})
	}

	function sortCustomers(cust){
		return new Promise((resolve, reject) => {
			// Sort array
			cust.sort(function(a, b){
				return a["user_id"] - b["user_id"];
			});
			
			resolve(cust);
		})
	}


	// function isObject(v) {
	// 	return '[object Object]' === Object.prototype.toString.call(v);
	// }

	// customers_temp.sort = function (o) {
	// 	if (Array.isArray(o)) {
	// 		return o.sort().map(JSON.sort);
	// 	} else if (isObject(o)) {
	// 		return Object
	// 			.keys(o)
	// 			.sort()
	// 			.reduce(function (a, k) {
	// 				a[k] = JSON.sort(o[k]);
	// 				return a;
	// 			}, {});
	// 	}
	// 	return o;
	// }

});

module.exports = router;