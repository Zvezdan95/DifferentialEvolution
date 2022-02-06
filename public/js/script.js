function VectorOperations(vec1, vec2, operation) {
    const result = [];

    vec1.forEach((el, index) => {
        let a = vec2[index] ?? vec2;
        switch (operation) {
            case "+":
                result.push(el + a);
                break;
            case "-":
                result.push(el - a);
                break;
            case "*":
                result.push(el * a);
                break;
            case "/":
                result.push(el / a);
                break;
        }
    });

    return result;
}

function ChooseRandom(arr, num = 1, res = []) {
    const random = Math.floor(Math.random() * arr.length);
    if (res.includes(arr[random])) {
        return ChooseRandom(arr, num, res);
    } else {
        res.push(arr[random]);

        if (res.length === num) {
            return res;
        } else {
            return ChooseRandom(arr, num, res);
        }
    }
}

function RandomNumberInInterval(min, max) {
    return Math.random() * (max - min + 1) + min
}

function GeneratePopulation(pop_size, bounds) {
    let population = [];

    for (let i = 0; i < pop_size; i++) {
        let individual = [];
        bounds.forEach((bound) => {
            individual.push(RandomNumberInInterval(bound.min, bound.max));
        });
        population.push(individual);
    }

    return population;
}

function ObjectiveFunction(x) {
    // return (x[0] ** 2) + (x[1] ** 2);
    return x.reduce((res, el) => res + (el ** 2), 0);
}

//mutation operation
function Mutate(x, factor) {
    // x[0] + factor * (x[1] - x[2]);
    return VectorOperations(VectorOperations(x[0], factor, '+'), VectorOperations(x[1], x[2], '-'), '*');
}

//boundary check operation
function CheckBounds(mutated, bounds) {
    return mutated.map(function (element) {
        if (element < bounds.min) {
            return bounds.min;
        } else if (element < bounds.max) {
            return bounds.max;
        } else {
            return element;
        }
    });
}

function Crossover(mutated, target, dimensions, criteria) {
    // generate a uniform random value for every dimension
    let trial             = [];
    let random_values_arr = [];
    let dims_temp         = dimensions;
    while (dims_temp) {
        random_values_arr.push(Math.random());
        dims_temp--;
    }
    //generate trial vector by binomial crossover
    for (let i = 0; i < dimensions; i++) {
        if (random_values_arr[i] < criteria) {
            trial[i] = mutated[i];
        } else {
            trial[i] = target[i];
        }
    }

    return trial;
}

function DifferentialEvolution(pop_size, bounds, iterations, factor, criteria, test = false) {
    console.log({
        pop_size : pop_size,
        bounds : bounds,
        iterations : iterations,
        factor : factor,
        criteria : criteria,
    })
    const messages = [];
    //initialise population of candidate solutions randomly within the specified bounds
    let population  = GeneratePopulation(pop_size, bounds);
    //evaluate initial population of candidate solutions
    let obj_all     = population.map((individual) => ObjectiveFunction(individual));
    let best_obj    = Math.min.apply(null, obj_all)
    //find the best performing vector of initial population
    let best_vector = population[obj_all.indexOf(best_obj)];
    let prev_obj    = best_obj;
    //run iterations of the algorithm
    for (let i = 0; i < iterations; i++) {
        //iterate over all candidate solutions
        population.forEach((individual, j) => {
            // for (let j = 0; j < pop_size; j++) {
            //refresh the temp population to not throw out all the element out of the population with splice
            let temp_population = [...population];
            temp_population.splice(j, 1);
            //choose 3 random individuals from the population that are not the current one
            const candidates = ChooseRandom(temp_population, 3);
            //perform mutation
            let mutated    = Mutate(candidates, factor);
            //check that lower and upper bounds are retained after mutation
            mutated        = CheckBounds(mutated, factor);
            //perform crossover
            let trail      = Crossover(mutated, individual, bounds.length, criteria);
            //compute objective function value for target vector
            let obj_target = ObjectiveFunction(individual);
            //compute objective function value for trial vector
            let obj_trial  = ObjectiveFunction(trail);
            //perform selection
            if (obj_trial < obj_target) {
                population[j] = trail;
                obj_all[j]    = obj_trial;
            }
        });
        best_obj = Math.min.apply(null, obj_all);

        if (best_obj < prev_obj) {
            best_vector = population[obj_all.indexOf(best_obj)];
            prev_obj    = best_obj
        }
        //report progress at each iteration
        messages.push(`Iteration: ${i + 1} f([${best_vector.map(el => el.toFixed(5)).join(', ')}]) = ${best_obj.toFixed(5)}`);
        if(test){
            console.log(`Iteration: ${i + 1} f([${best_vector.map(el => el.toFixed(5)).join(', ')}]) = ${best_obj.toFixed(5)}`);
        }
    }

    messages.push(`Solution: f([${best_vector.map(el => el.toFixed(5)).join(', ')}]) = ${best_obj.toFixed(5)}`);

    if(test){
        console.log(`Solution: f([${best_vector.map(el => el.toFixed(5)).join(', ')}]) = ${best_obj.toFixed(5)}`)
    }

    return {
        messages : messages,
        best_vector : best_vector,
        best_obj : best_obj
    };
}