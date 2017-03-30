game.ball = {
    stroke: 1,
    // Since the math for the X and Z directions is the same, throughout this object, "R" is used as a stand-in for X or Z when it can be specified by the caller of the function/property
    launch: function(v0lat, angleLat, v0y, spin) {
        this.angleLat = angleLat;

        // Array length, makes life/processing easier
        this.divs = 1;
        // Height array
        // TODO: look into preallocating with an estimated amount of entries to save time for this.h and this.lat
        this.h = [this.pos.y];
        // Lateral position array
        // Everything lateral is just x and z in the plane of the lateral angle
        this.x = [this.pos.x];
        this.z = [this.pos.z];
        // Vertical velocity
        let vY = v0y;
        // Lateral velocity
        let vLat = v0lat;
        let sinLat = Math.sin(angleLat);
        let cosLat = Math.cos(angleLat);
        // Delta t, lower = higher precision and longer swing time
        this.dt = Math.pow(10, -5);
        // Spin decay per iteration
        let decay = Math.exp(-this.dt/30);
        let s = spin;

        let xSign = Math.sign(cosLat);
        let xIndex = (1 - xSign) / 2;
        let xCurrent = xIndex * (game.tree_xSorted.length - 1);
        while(game.tree_xSorted[xCurrent] !== undefined && xSign * this.pos.x > xSign * game.tree_xSorted[xCurrent][xIndex]) {
            xCurrent += xSign;
        }

        let zSign = Math.sign(sinLat);
        let zIndex = (1 - zSign) / 2 + 3;
        let zCurrent = (zIndex - 3) * (game.tree_zSorted.length - 1);
        while(game.tree_zSorted[zCurrent] !== undefined && zSign * this.pos.z > zSign * game.tree_zSorted[zCurrent][zIndex]) {
            zCurrent += zSign;
        }

        while(this.divs === 1 || this.h[this.divs-1] > 0) { // If it's the first calculation or we're above the ground
            // Net velocity magnitude
            let v = Math.sqrt(Math.pow(vY, 2) + Math.pow(vLat, 2));
            // Accelerations
            let aY = this.q * v * (this.CL * vLat - this.CD * vY) - this.g;
            let aLat = this.q * v * (-this.CL * vY - this.CD * vLat);
            // Update spin
            s *= decay;
            // Euler's method
            vY += aY * this.dt;
            vLat += aLat * this.dt;
            this.h[this.divs] = this.h[this.divs-1] + vY * this.dt;
            this.x[this.divs] = this.x[this.divs-1] + vLat * this.dt * cosLat;
            this.z[this.divs] = this.z[this.divs-1] + vLat * this.dt * sinLat;

            if(game.tree_xSorted[xCurrent] !== undefined && xSign * this.x[this.divs] >= xSign * (game.tree_xSorted[xCurrent][xIndex] - this.realRadius)) {
                if(this.h[this.divs] <= game.tree_xSorted[xCurrent][2] && this.z[this.divs] >= game.tree_xSorted[xCurrent][3] && this.z[this.divs] <= game.tree_xSorted[xCurrent][4]) {
                    this.x[this.divs] = game.tree_xSorted[xCurrent][xIndex] - this.realRadius * xSign;
                    cosLat = -cosLat;
                    xSign = -xSign;
                    xIndex = 1 - xIndex;
                }
                xCurrent += xSign;
            }

            if(game.tree_zSorted[zCurrent] !== undefined && zSign * this.z[this.divs] >= zSign * (game.tree_zSorted[zCurrent][zIndex] - this.realRadius)) {
                if(this.h[this.divs] <= game.tree_zSorted[zCurrent][2] && this.x[this.divs] >= game.tree_zSorted[zCurrent][0] && this.x[this.divs] <= game.tree_zSorted[zCurrent][1]) {
                    this.z[this.divs] = game.tree_zSorted[zCurrent][zIndex] - this.realRadius * zSign;
                    sinLat = -sinLat;
                    zSign = -zSign;
                    zIndex = (1 - zSign) / 2 + 3;
                }
                zCurrent += zSign;
            }

            // Increase iterative variable
            this.divs++;
        }
        this.time = 0;
    },
    update(dt) {
        if(!this.moving) {
            // If we're not moving yet
            if(this.time === 0) {
                // If the launch function has finished
                // Start moving next update
                this.moving = true;
            }
            // End
            return 0;
        }

        this.time += dt;
        // Find our closest pre-calculated position by reducing it to one of the array indices
        let index = Math.floor(this.time / this.dt);
        this.pos.y = this.h[index];
        if(index >= this.divs) {
            // If we're at the end of the shot
            // Put us on the ground on the last frame
            this.pos.y = 0;
            index = this.divs - 1;
            this.moving = false;
            this.stroke++;
        }
        this.pos.x = this.x[index];
        this.pos.z = this.z[index];
    }
}

// Setting ball constants
// Radius in meters
game.ball.realRadius = 0.02135;
// Acceleration of gravity in meters per second
game.ball.g = 9.80665;
// Whether or not the ball is mid-launch
game.ball.moving = false;
// Radius of image in pixels (for drawing purposes)
game.ball.radius = 5;
// Initial position
game.ball.pos = {x: 0, z: 0, y: 0};
// Diameter of image in pixels (for drawing purposes)
game.ball.diameter = game.ball.radius * 2;
let p = 1.225;
let m = 0.04593;
// q value
//             Cd      p                              A                          m
game.ball.q = (0.5) * (p) * (Math.PI * Math.pow(game.ball.realRadius, 2)) / (2 * m);
game.ball.CL = 0.15;
game.ball.CD = 0.21;
