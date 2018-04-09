# The Serverless version of the AutoLotto code challenge

This is a straight forward copy and paste of the AutoLotto code challenge into the Serverless Framework.

## Deploying

clone this repo

npm install

Make sure your AWS_PROFILE is set to the correct account

serverless deploy

Grab the corresponding url end point

Feel free to test with my endpoint

    https://pl70ccpryg.execute-api.us-east-1.amazonaws.com/dev/api

Do a POST with

    [
        {
        "message": "2 Win the Lotto!",
        "game": "powerball",
        "gameDate": "2018-04-01",
        "powerPlay": true,
        "line": [
            {
              "value": "8",
              "type": "NUMBER"
            },
            {
              "value": "4",
              "type": "NUMBER"
            },
            {
              "value": "2",
              "type": "NUMBER"
            },
            {
              "value": "5",
              "type": "NUMBER"
            },
            {
              "value": "1",
              "type": "NUMBER"
            },
            {
              "value": "71",
              "type": "NUMBER",
              "name": "Powerball",
              "category": "EXTRA"
            }
          ]
    },
    {
        "message": "Win the Lotto!",
        "game": "powerball",
        "gameDate": "2018-04-01",
        "powerPlay": false,
        "line": [
            {
              "value": "8",
              "type": "NUMBER"
            },
            {
              "value": "24",
              "type": "NUMBER"
            },
            {
              "value": "52",
              "type": "NUMBER"
            },
            {
              "value": "55",
              "type": "NUMBER"
            },
            {
              "value": "61",
              "type": "NUMBER"
            },
            {
              "value": "21",
              "type": "NUMBER",
              "name": "Powerball",
              "category": "EXTRA"
            }
          ]
    }
    ]


You should see something like this:

```json
{
    "totalAmountWon": 50000000,
    "results": [
        {
            "date": "2018-04-01",
            "powerPlay": true,
            "powerBall": "71",
            "originalWhites": [
                "8",
                "4",
                "2",
                "5",
                "1"
            ],
            "matchedPowerBall": false,
            "matchingNumbers": [
                "8"
            ],
            "amountWon": 0
        },
        {
            "date": "2018-04-01",
            "powerPlay": false,
            "powerBall": "21",
            "originalWhites": [
                "8",
                "24",
                "52",
                "55",
                "61"
            ],
            "matchedPowerBall": true,
            "matchingNumbers": [
                "8",
                "24",
                "52",
                "55",
                "61"
            ],
            "amountWon": 50000000
        }
    ]
}
```
