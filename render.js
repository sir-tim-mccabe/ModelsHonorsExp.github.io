game.render = function(dt) {
    // Clear foreground for redraw
    this.leftCx.clearRect(0, 0, this.leftWidth, this.height);
    let scale = this.leftWidth / (this.ball.pos[0] - this.leftEdge + 2) / 1.1;
    if(scale < this.scale) {
        // If the scale is shrinking, don't change it.
        this.scale = scale;
    }
    // Calculate left edge in pixels - for drawing purposes.
    let realLeftEdge = this.scale * this.leftEdge;
    // Put the new scale on the screen in yards per 30 pixels.
    this.leftCx.fillText(Math.round(1000 * 30 / this.scale * 1.09361) / 1000, 20, 30);
    // Calculate the size of the stick man
    let manHeight = 1.8 * this.scale;
    let manWidth = manHeight / 3;
    let groundHeight = this.getGroundHeight();
    // Draw stick man with his "feet" a little behind the (0, 0) point.
    this.leftCx.drawImage(this.manImage, -realLeftEdge - manWidth - 1, groundHeight - manHeight, manWidth, manHeight);
    for(let i = 0; i < this.walls.length; i++) {
        // Draw the walls
        this.leftCx.fillRect(-realLeftEdge + this.scale * this.walls[i][0], groundHeight - this.scale * this.walls[i][2],
                         this.scale * (this.walls[i][1] - this.walls[i][0]), this.scale * this.walls[i][2]);
    }
    if(!this.ball.moving) {
        // If we're awaiting input
        // Tell the user we're awaiting input
        this.leftCx.fillText("Press any key or tap screen", 20, 80);
        // Get ready to draw lines
        this.leftCx.beginPath();
        this.leftCx.moveTo(-realLeftEdge, groundHeight - this.ball.radius);
        this.leftCx.lineTo(-realLeftEdge + 400 * Math.cos(this.angle) * this.power, groundHeight - this.ball.radius - 400 * Math.sin(this.angle) * this.power);
        // Write the line to the screen
        this.leftCx.stroke();
    }
    // Draw the ball
    // Commented line below is for discussion purposes - I'm on the fence about which of these to use
    // this.leftCx.drawImage(this.ballImage, -realLeftEdge + this.ball.pos[0]*this.scale - this.ball.radius, groundHeight - (this.ball.pos[1] + this.ball.realRadius)*this.scale - this.ball.radius, this.ball.diameter, this.ball.diameter);
    this.leftCx.drawImage(this.ballImage, -realLeftEdge + this.ball.pos[0]*this.scale - this.ball.radius, groundHeight - this.ball.pos[1]*this.scale - this.ball.diameter, this.ball.diameter, this.ball.diameter);

    // Draw line between corners of right canvas to demonstrate
    this.rightCx.clearRect(0, 0, this.rightWidth, this.height);
    let diameter = this.ball.diameter/(1 - this.ball.pos[1]/40);
    this.rightCx.drawImage(this.ballImage, this.rightWidth / 2 - this.ball.radius, this.height*0.8 - this.ball.pos[0]*5, diameter, diameter);
}