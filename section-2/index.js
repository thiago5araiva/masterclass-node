/***
 * Title: Basic Node Example
 * Descriptions: Simple file that declares a few functions and invokes them.
 * Author: Thiago Saraiva
 * Date: 13/01/2024
 */

// Dependencies
const math = require("./lib/math")
const jokes = require("./lib/jokes")

//App object
const app = {}

app.config = {
  timeBetweenJokes: 1000,
}

// Function that prints a random joke
app.printAJoke = function () {
  // Get all the jokes
  const allJokes = jokes.all()

  // Get the length of the jokes
  const numberOfJokes = allJokes.length

  // Pick a random number between 1 and the number of jokes
  const randomNumber = math.getRandomNumber(1, numberOfJokes)

  // Get the joke at that position in the array (minus one)
  const selectedJoke = allJokes[randomNumber - 1]

  // Send the joke to the console
  console.log(selectedJoke)
}

app.indefiniteLoop = function () {
  // Create the interval, using the config variable defined above
  setInterval(app.printAJoke, app.config.timeBetweenJokes)
}

app.indefiniteLoop()
