'use strict'

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
let request = require('request')
let _ = require('underscore');
AWS.config.region = 'us-east-1';


module.exports.api = (event, context, callback) => {
  console.log('Entered API')
  console.log('event')
  console.log(JSON.stringify(event,null,2))



    let requestBody = event.body
    let tickets_lines = []

    // convert the requested tickets into manageable arrays

    requestBody.forEach(function(ticket, i){
        if(ticket.hasOwnProperty("line")){
            if(ticket.line.length>1){
                let line = []
                let line2 = []
                line[0] = ticket.gameDate.substr(0, 10)
                line[1] = ticket.powerPlay
                ticket.line.forEach(function(numbers, x){
                    if(numbers.type === 'NUMBER'){
                        if(x < 5) {
                            line2[x] = numbers.value
                        }else if(x == 5) {
                            line[2] = numbers.value // powerball
                            line[3] = line2 // powerball
                            tickets_lines.push(line)
                            line2 = null
                            line = null
                        }
                    }
                })

            }
        }
    });

    // make the call to the test end point to fetch lottery results

    request.get(
        'https://games.api.lottery.com/api/v2.0/results?game=59bc2b6031947b9daf338d32',
        function(err, response, body){
            let totalAmountWon = 0
            let result = JSON.parse(body)
            let intersect = _.intersection([1, 2, 3], [101, 2, 1, 10], [2, 1])
            let results_lines = []

            // convert lottery results into manageable arrays

            result.forEach(function(ticket, i){

                if(ticket.hasOwnProperty("results") && ticket.results.hasOwnProperty('values')){
                    if(ticket.results.values.length>1){
                        let line = []
                        let line2 = []
                        let jackpot = 0

                        line[0] = ticket.resultsAnnouncedAt.substr(0, 10) // result date

                        if(ticket.prizes.values.length>0){
                            jackpot = ticket.prizes.values[0].value // jackpot value for ticket
                        }

                        ticket.results.values.forEach(function(numbers, x){
                            if(numbers.type === 'NUMBER'){ // verify that this is a number
                                if(x < 5) {
                                    line2[x] = numbers.value // white ball numbers
                                }else if(x == 5) {
                                    line[1] = numbers.value // powerball
                                }else if(x == 6) {
                                    line[2] = numbers.value // powerplay
                                    line[3] = line2
                                    results_lines.push(line)
                                    // iterate over requested tickets to match with this lottery result
                                    tickets_lines.forEach(function (purchasedTicket, x) {

                                        // function to apply multiplier
                                        let applyMultiplier = function (playMultiplier, amountWon, powerPlayValue) {
                                            if (playMultiplier == true) {
                                                amountWon = amountWon * powerPlayValue;
                                            }
                                            return amountWon;
                                        };

                                        // verify the dates are the same
                                        if(purchasedTicket[0] == line[0]){

                                            // use underscore to find matching numbers based on the two arrays

                                            let intersect = _.intersection(purchasedTicket[3], line[3])
                                            let powerBall = false

                                            if(line[1] == purchasedTicket[2]){ // verify powerball
                                                powerBall = true
                                                purchasedTicket[4] = true
                                            }else{
                                                purchasedTicket[4] = false
                                            }

                                            // if matching numbers exists then add to the tickets_lines array
                                            if(intersect.length>0){
                                                // add the intersection array
                                                purchasedTicket[5] = intersect
                                            }
                                            let playMultiplier = purchasedTicket[1]  // determine if multiplier purchased
                                            let amountWon = 0
                                            let powerPlayValue = line[2] // value of the powerPlay in lottery results

                                            // determine winnings based on winning matrix

                                            if (powerBall == true && intersect.length == 0) {
                                                amountWon = 4
                                                amountWon = applyMultiplier(playMultiplier, amountWon, powerPlayValue);
                                            }
                                            if (powerBall == true && intersect.length == 1) {
                                                amountWon = 4
                                                amountWon = applyMultiplier(playMultiplier, amountWon, powerPlayValue);
                                            }
                                            if (powerBall == true && intersect.length == 2) {
                                                amountWon = 7
                                                amountWon = applyMultiplier(playMultiplier, amountWon, powerPlayValue);
                                            }
                                            if (powerBall == true && intersect.length == 3) {
                                                amountWon = 100
                                                amountWon = applyMultiplier(playMultiplier, amountWon, powerPlayValue);
                                            }
                                            if (powerBall == true && intersect.length == 4) {
                                                amountWon = 50000
                                                amountWon = applyMultiplier(playMultiplier, amountWon, powerPlayValue);
                                            }
                                            if (powerBall == true && intersect.length == 5) {
                                                amountWon = jackpot
                                            }
                                            if (powerBall == false && intersect.length == 5) {
                                                if(playMultiplier == true){
                                                    amountWon = 2000000
                                                }else{
                                                    amountWon = 1000000
                                                }
                                            }
                                            if (powerBall == false && intersect.length == 4) {
                                                amountWon = 100
                                                amountWon = applyMultiplier(playMultiplier, amountWon, powerPlayValue);
                                            }
                                            if (powerBall == false && intersect.length == 3) {
                                                amountWon = 7
                                                amountWon = applyMultiplier(playMultiplier, amountWon, powerPlayValue);
                                            }

                                            purchasedTicket[6] = amountWon // assign amount won to this ticket

                                            totalAmountWon += amountWon // sum total amount won
                                        }
                                    })
                                    line2 = null
                                    line = null
                                }
                            }
                        })
                    }
                }
            });

            // Create return JSON object

            let jsonRoot = {totalAmountWon: totalAmountWon}
            let json_response = []
            tickets_lines.forEach(function(ticket, i){
                let jsonTicket = {
                    date: ticket[0],
                    powerPlay: ticket[1],
                    powerBall: ticket[2],
                    originalWhites: ticket[3],
                    matchedPowerBall: ticket[4],
                    matchingNumbers: ticket[5],
                    amountWon: ticket[6],
                }
                json_response.push(jsonTicket)
            })
            jsonRoot.results = json_response
            // res.json(jsonRoot);

            let apiInfo = {
                companyName: 'Lottery.com',
                statusCode: 200
            }

            callback(null, jsonRoot)

        })

}
