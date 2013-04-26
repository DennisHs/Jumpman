// Main game framework.
//
///////////////////////////////////////////////////////////////////////////////

var JumpmanGame = function()
{
    // Game settings
    var maxFlyingRock = 3;
    var rockRange = 60;
    var rockFlyingTime = 4500;
    var rockFlyingTimeMax = 4500;
    var moveRange = 3;
    var jumpRange = 5;
    var rockHeight = 2.2
    var totalRow = 5;
    var hitDistance = 4;
    
    // System attributes
    var cookieEngine;
    var gl;
    var sceneEngine = new SceneEngine();
    
    // Key attributes
    var currentlyPressedKeys = {};
    
    // Camera control
    var pitch = 0;
    var pitchRate = 0;
    var xPos = 0;
    var yPos = 0.4;
    var zPos = 0;
    var cameraPos = [0.0, 3.0, 0.0];
    
    // Used to make us "jog" up and down as we move forward.
    var joggingAngle = 0;
    
    // Game objects
    var jumper;
    var rocks = [];
    var jumperPos = [0.0, 0.0, -15.0];
    var wallPos = [0.0, 12.0, -18.0];
    var wallSize = 12;
    
    // Game logic
    var nextWave = 0;
    var hitCount = 0;
    var totalRound = 0;
    var pause = false;
    
    ///////////////////////////////////////////////////////////////////////////
    // General event handler
    ///////////////////////////////////////////////////////////////////////////
    function handleKeyDown(event)
    {
        window.console.log("[JumpmanGame][handleKeyDown] Key down");
        if (!jumper)
            return;
        var keyCodeChar = String.fromCharCode(event.keyCode);
        window.console.log("[JumpmanGame][handleKeyDown] On key code: " + event.keyCode + " str: \"" + keyCodeChar + "\"");
        currentlyPressedKeys[event.keyCode] = true;
        if (keyCodeChar == "P")
        {
            window.console.log("[Dennis] The pause: " + pause);
            if (pause == true) pause = false;
            else pause = true;
        }
    }
    
    function handleKeyUp(event)
    {
        window.console.log("[JumpmanGame][handleKeyUp] Key up");
        if (!jumper)
            return;
        currentlyPressedKeys[event.keyCode] = false;
    }
    
    function handleKeys()
    {
        if (!jumper)
            return;
            
        if (currentlyPressedKeys[33])
        {
            // Page Up
        }
        if (currentlyPressedKeys[34])
        {
            // Page Down
        }
        
        if (currentlyPressedKeys[37])
        {
            // Left cursor key
            // Make the jumper move left
            jumper.onMove("left");
        }
        
        if (currentlyPressedKeys[39])
        {
            // Right cursor key
            // Make the jumper move right
            jumper.onMove("right");
        }
        
        if (currentlyPressedKeys[38] || currentlyPressedKeys[32])
        {
            // Up cursor key or Space
            // Make the jumper start jump if state is "stand"
            window.console.log("[Dennis] Handle jump");
            jumper.onJump();
        }
        
        if (currentlyPressedKeys[40])
        {
            // Down cursor key
            // No use
        }
        
        if (currentlyPressedKeys[33])
        {
            // Page Up
            pitchRate = 0.1;
        }
        else if (currentlyPressedKeys[34])
        {
            // Page Down
            pitchRate = -0.1;
        }
        else
        {
            pitchRate = 0;
        }
        
        if (currentlyPressedKeys[38] || currentlyPressedKeys[87])
        {
            // Up cursor key or W
            speed = 0.003;
        }
        else if (currentlyPressedKeys[40] || currentlyPressedKeys[83])
        {
            // Down cursor key
            speed = -0.003;
        }
        else
        {
            speed = 0;
        }
    }
    
    function onRefreshUI()
    {
        var deadCounter = document.getElementById("deadCounter");
        deadCounter.textContent = "Dead Count: " + hitCount;
        var roundCounter = document.getElementById("roundCounter");
        roundCounter.textContent = "Round: " + totalRound;
    }
    
    ///////////////////////////////////////////////////////////////////////////
    // Functions work with CookieGLEngine
    ///////////////////////////////////////////////////////////////////////////
    var run = function()
    {
        cookieEngine = new CookieGLEngine();
        
        // Install custom functions.
        cookieEngine.onInitGLComplete = this.onInitGLComplete;
        cookieEngine.initBuffers = this.initBuffers;
        cookieEngine.drawScene = this.drawScene;
        cookieEngine.animate = this.animate;
        return cookieEngine.run();
    }
    
    var onInitGLComplete = function()
    {
        window.console.log("[JumpmanGame][onInitGLComplete] Init GL complete");
        gl = cookieEngine.getGL();
        
        var shaderProgram = cookieEngine.getShaderProgram();
        sceneEngine.initialize(cookieEngine);
        document.onkeydown = handleKeyDown;
        document.onkeyup = handleKeyUp;
    }
    
    var initBuffers = function()
    {
        jumper = new Jumpman("Man", jumpRange, moveRange, totalRow);
        jumper.initResource(gl);
        jumper.setPosition(jumperPos);
        sceneEngine.addScene(jumper, jumper.entityName);
        cookieEngine.initTexture(jumper.textureName);
        
        // TODO: Make it texture !!!
        var walls = new WallBox("Walls", wallSize);
        walls.initResource2(gl);
        walls.setPosition(wallPos);
        sceneEngine.addScene(walls, walls.entityName);
    }
    
    var drawScene = function()
    {
        cookieEngine.onCanvasReshape();
        
        var viewportWidth = cookieEngine.getViewportWidth();
        var viewportHeight = cookieEngine.getViewportHeight();
        
        gl.viewport(0, 0, viewportWidth, viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        var prjMatrix = cookieEngine.getPrjMatrix();
        var mvMatrix = cookieEngine.getMVMatrix();
        
        mat4.perspective(prjMatrix, 45, viewportWidth / viewportHeight, 0.1, 100.0);
        mat4.identity(mvMatrix);
        
        var sceneTransPos = [-cameraPos[0], -cameraPos[1], -cameraPos[2]];
        mat4.translate(mvMatrix, mvMatrix, sceneTransPos);
        
        mat4.rotate(mvMatrix, mvMatrix, cookieEngine.degToRad(-pitch), [1, 0, 0]);
        mat4.translate(mvMatrix, mvMatrix, [-xPos, -yPos, -zPos]);
        
        sceneEngine.onDrawScene();
    }
    
     var animate = function()
    {
        if (pause) return;
        try
        {
            handleKeys();
            var elapsed = sceneEngine.onAnimateScene();
            
            if (nextWave <= 0)
            {
                totalRound += 1;
                createRocks(gl);
                nextWave = 6000 -  - totalRound * 200;
                rockFlyingTime = rockFlyingTimeMax - totalRound * 200;
                maxFlyingRock += 1;
                onRefreshUI();
            }
            
            checkHits();
            nextWave -= elapsed;
            
            if (sceneEngine.lastAnimateTime != 0)
            {
                if (speed != 0)
                {
                    joggingAngle += elapsed * 0.6; // 0.6 "fiddle factor" - makes it feel more realistic :-)
                    yPos = Math.sin(cookieEngine.degToRad(joggingAngle)) / 20 + 0.4
                }
                
                pitch += pitchRate * elapsed;
            }
        }
        catch (e)
        {
            pause = true;
            window.console.log("[JumpmanGame][Error] Animate exception: " + e);
            window.console.log("Stack:\n" + e.stack);
        }
    }
    
    function createRocks(gl)
    {
        for (var rockIdx in rocks)
        {
            var rock = rocks[rockIdx];
            window.console.log("[JumpmanGame][createRocks] Remove the: " + rock.entityName);
            sceneEngine.removeScene(rock.entityName);
            rock.release(gl);
        }
        
        // Clear previous objects.
        rocks = [];
        
        var exam = [];
        for (var i=0; i<maxFlyingRock; i++)
        {
            var idx = Math.floor(totalRow * 2 * Math.random());
            if (exam[idx]) continue;
            exam[idx] = true;
            var rock = new Flyrock("The Rock " + i);
            rock.initRockModel2(gl);
            
            var startPosition = [(totalRow - 1) / -2 * moveRange, rockHeight / 2, -1 * rockRange];
            startPosition[0] += (idx % totalRow) * moveRange;
            startPosition[1] += Math.floor(idx / totalRow) * rockHeight;
            
            var endPosition = startPosition.slice();
            endPosition[2] = 0;
            
            rock.setFly(rockFlyingTime, startPosition, endPosition);
            rocks.push(rock);
            sceneEngine.addScene(rock, rock.entityName);
            
            window.console.log("[JumpmanGame][createRocks] New rock position: " + 
                    startPosition[0] + ", " + startPosition[1] + ", " + startPosition[2]);
        }
    }
    
    var checkHits = function()
    {
        jumperPos = jumper.getPosition();
        
        for (var rockIdx in rocks)
        {
            var rock = rocks[rockIdx];
            if (rock.isHit) continue;
            
            rockPos = rock.getPosition();
            
            var dis = 0;
            for (var i=0; i<3; i++)
            {
                var d = jumperPos[i] - rockPos[i];
                dis += d * d;
            }
            
            if (dis > Math.sqrt(hitDistance)) continue;
            rock.isHit = true;
            hitCount++;
            if (hitCount >= 5)
                pause = true;
            window.console.log("[JumpmanGame][checkHits] Hit by: " + rock.entityName + " with: " + dis + " Hit count: " + hitCount);
            onRefreshUI();
        }
    }

    return {
        run: run,
        handleKeyDown: handleKeyDown,
        handleKeyUp: handleKeyUp,
        onInitGLComplete: onInitGLComplete,
        initBuffers: initBuffers,
        drawScene: drawScene,
        animate: animate,
        checkHits: checkHits,
        
        pause: pause,
    };
}

///////////////////////////////////////////////////////////////////////////////

// Jump and move procedure for each tick:
//   Chech key handle for key down.
//   Move object. 

function Jumpman(name, jumpRange, moveRange, totalRow)
{
    window.console.log("[Jumpman][Jumpman] Jumpman contruct: " + name);
    Entity.call(this, name);
    
    // stand/up/fly/down
    this.jumpState = "stand";
    // stand/left/right
    this.moveState = "stand";
    // up/fly/down
    this.stateDurations = [600, 90, 600];
    this.moveDuration = 300;
    this.jumpRange = jumpRange;
    this.moveRange = moveRange;
    this.totalRow = totalRow;
    this.movingVector = [0, 0, 0];
    this.jumpingTime = 0;
    this.movingTime = 0;
    this.finalPosition = [0, 0, 0];
    this.textureName = "Jumpman.png";
}

Jumpman.prototype = new Entity("Jumpman Class");
Jumpman.prototype.constructor = Jumpman;

Jumpman.prototype.initResource = function(gl)
{
    this.initJumperModel4(gl);
}

Jumpman.prototype.initJumperModel = function(gl)
{
    var vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    var vertices = [
            // Front face
            -1.0, -1.0,  1.0,
             1.0, -1.0,  1.0,
             1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,

            // Back face
            -1.0, -1.0, -1.0,
            -1.0,  1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0, -1.0, -1.0,

            // Top face
            -1.0,  1.0, -1.0,
            -1.0,  1.0,  1.0,
             1.0,  1.0,  1.0,
             1.0,  1.0, -1.0,

            // Bottom face
            -1.0, -1.0, -1.0,
             1.0, -1.0, -1.0,
             1.0, -1.0,  1.0,
            -1.0, -1.0,  1.0,

            // Right face
             1.0, -1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0,  1.0,  1.0,
             1.0, -1.0,  1.0,

            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,
            -1.0,  1.0,  1.0,
            -1.0,  1.0, -1.0
        ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    this.setVertexPositionBuffer(gl, vertexPositionBuffer, 3);
    this.setVertexItemNumber(24);

    var vertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    var colors = [
            [1.0, 0.0, 0.0, 1.0], // Front face
            [1.0, 1.0, 0.0, 1.0], // Back face
            [0.0, 1.0, 0.0, 1.0], // Top face
            [1.0, 0.5, 0.5, 1.0], // Bottom face
            [1.0, 0.0, 1.0, 1.0], // Right face
            [0.0, 0.0, 1.0, 1.0]  // Left face
        ];
    var unpackedColors = [];
    for (var i in colors)
    {
        var color = colors[i];
        for (var j=0; j < 4; j++)
        {
            unpackedColors = unpackedColors.concat(color);
        }
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColors), gl.STATIC_DRAW);
    this.setVertexColorBuffer(gl, vertexColorBuffer, 4);
    
    var vertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
    var vertexIndices = [
        0, 1, 2,      0, 2, 3,    // Front face
        4, 5, 6,      4, 6, 7,    // Back face
        8, 9, 10,     8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15, // Bottom face
        16, 17, 18,   16, 18, 19, // Right face
        20, 21, 22,   20, 22, 23  // Left face
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), gl.STATIC_DRAW);
    this.setVertexIndexBuffer(vertexIndexBuffer, 1, 36);
    this.setVertexDrawMethod(gl.TRIANGLES);
}

Jumpman.prototype.initJumperModel2 = function(gl)
{
    var vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    var vertices = [
            // Front face
             0.0,  1.0,  0.0,
            -1.0, -1.0,  1.0,
             1.0, -1.0,  1.0,

            // Right face
             0.0,  1.0,  0.0,
             1.0, -1.0,  1.0,
             1.0, -1.0, -1.0,

            // Back face
             0.0,  1.0,  0.0,
             1.0, -1.0, -1.0,
            -1.0, -1.0, -1.0,

            // Left face
             0.0,  1.0,  0.0,
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0
        ];
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    this.setVertexPositionBuffer(gl, vertexPositionBuffer, 3);
    this.setVertexItemNumber(12);

    var vertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    var colors = [
            // Front face
            1.0, 0.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0,

            // Right face
            1.0, 0.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
            0.0, 1.0, 0.0, 1.0,

            // Back face
            1.0, 0.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0,

            // Left face
            1.0, 0.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
            0.0, 1.0, 0.0, 1.0
        ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    this.setVertexColorBuffer(gl, vertexColorBuffer, 4);
    this.setVertexDrawMethod(gl.TRIANGLES);
}

Jumpman.prototype.initJumperModel3 = function(gl)
{
    var model = createJumperModel("color");
    
    this.vertexPositions = model.vertex;
    this.vertexColors = model.color;
    this.textureCoords = [];
    this.vertexIndices = model.index;
    
    this.bindVertexBuffers(gl, model.vertex, model.vertexItemSize, model.vertexItemNumbers,
            model.color, model.colorItemSize,
            model.index, model.indexItemSize, model.indexItemNumbers);
    this.setVertexDrawMethod(gl.TRIANGLES);
}

Jumpman.prototype.initJumperModel4 = function(gl)
{
    var model = createJumperModel("texture");
    
    this.vertexPositions = model.vertex;
    this.textureCoords = model.textureCoords;
    this.vertexIndices = model.index;
    
    this.bindVertexTextureBuffer(gl, model.vertex, model.vertexItemSize, model.vertexItemNumbers,
            model.textureCoords, model.textureCoordItemSize,
            model.index, model.indexItemSize, model.indexItemNumbers);
            
    this.setVertexDrawMethod(gl.TRIANGLES);
}

Jumpman.prototype.setPosition = function(position)
{
    this.position = position.slice();
    this.finalPosition = position.slice();
}

Jumpman.prototype.onAnimate = function(elapsed)
{
    this.handleJump(elapsed);
    this.handleMove(elapsed);
}

Jumpman.prototype.onJump = function()
{
    // This function should called when jump key press.
    if (this.jumpState == "stand")
    {
        // Give a full start jump time.
        this.jumpState = "up";
        this.jumpingTime = this.stateDurations[0];
        this.finalPosition[1] += this.jumpRange;
        window.console.log("[Jumper][handleJump] Change state to up.");
    }
    else
    {
        window.console.log("[Jumper][handleJump] Skip onJump.");
    }
}

Jumpman.prototype.handleJump = function(elapsed)
{
    if (this.jumpState == "up")
    {
        //window.console.log("[Jumper][handleJump] Handle up: " + elapsed + 
        //        " left time: " + this.jumpingTime +
        //        " current Y: " + this.position[1]);
        this.position[1] += elapsed / this.stateDurations[0] * this.jumpRange;
        this.jumpingTime -= elapsed;
        if (this.jumpingTime <= 0)
        {
            this.position[1] = this.finalPosition[1];
            this.jumpState = "fly";
            this.jumpingTime = this.stateDurations[1];
            window.console.log("[Jumper][handleJump] Change state to fly." +
                " Y to: " + this.finalPosition[1]);
        }
    }
    else if (this.jumpState == "fly")
    {
        this.jumpingTime -= elapsed;
        //window.console.log("[Jumper][handleJump] Handle fly: " + elapsed +
        //        " current Y: " + this.position[1] +
        //        " left time: " + this.jumpingTime);
        if (this.jumpingTime <= 0)
        {
            this.jumpState = "down";
            this.jumpingTime = this.stateDurations[2];
            this.finalPosition[1] -= this.jumpRange;
            window.console.log("[Jumper][handleJump] Change state to down.");
        }
    }
    else if (this.jumpState == "down")
    {
        //window.console.log("[Jumper][handleJump] Handle down: " + elapsed + 
        //        " left time: " + this.jumpingTime +
        //        " current Y: " + this.position[1]);
        this.position[1] -= elapsed / this.stateDurations[2] * this.jumpRange;
        this.jumpingTime -= elapsed;
        if (this.jumpingTime <= 0)
        {
            window.console.log("[Jumper][handleJump] Before reset: " + this.position[1]);
            this.position[1] = this.finalPosition[1];
            this.jumpState = "stand";
            this.jumpingTime = 0;
            window.console.log("[Jumper][handleJump] Jump finish.");
        }
    }
}

Jumpman.prototype.onMove = function(moveTo)
{
    if (this.moveState == "stand")
    {
        if (moveTo == "left" && this.finalPosition[0] > (this.totalRow - 1) / -2 * this.moveRange)
        {
            this.finalPosition[0] -= this.moveRange;
        }
        else if (moveTo == "right" && this.finalPosition[0] < (this.totalRow - 1) / 2 * this.moveRange)
        {
            this.finalPosition[0] += this.moveRange;
        }
        else
        {
            window.console.log("[Jumpman][onMove] Skip move.");
            return;
        }
        window.console.log("[Jumpman][onMove] Move to: " + moveTo);
        this.moveState = moveTo;
        this.movingTime = this.moveDuration;
    }
}

Jumpman.prototype.handleMove = function(elapsed)
{
    if (this.moveState == "stand")
        return;
    
    var diff = elapsed / this.moveDuration;
    if (this.moveState == "left")
    {
        diff = diff * -1;
    }
    this.position[0] += diff * this.moveRange;
    this.movingTime -= elapsed;
    if (this.movingTime <= 0)
    {
        this.position[0] = this.finalPosition[0];
        this.moveState = "stand";
        this.movingTime = 0;
    }
}

///////////////////////////////////////////////////////////////////////////////

function Flyrock(name)
{
    window.console.log("[Jumpman][Flyrock] Flyrock contruct: " + name);
    Entity.call(this, name);
    
    this.startTime = 0;
    this.flyTime = 5000;
    this.startPosition = [0, 0, 0];
    this.finalPosition = [0, 0, 0];
    this.isHit = false;
    this.textureName = "box.png";
}

Flyrock.prototype = new Entity("Flyrock Class");
Flyrock.prototype.constructor = Flyrock;

Flyrock.prototype.initRockModel = function(gl)
{
    var vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    var vertices = [
            // Front face
            -1.0, -1.0,  1.0,
             1.0, -1.0,  1.0,
             1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,

            // Back face
            -1.0, -1.0, -1.0,
            -1.0,  1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0, -1.0, -1.0,

            // Top face
            -1.0,  1.0, -1.0,
            -1.0,  1.0,  1.0,
             1.0,  1.0,  1.0,
             1.0,  1.0, -1.0,

            // Bottom face
            -1.0, -1.0, -1.0,
             1.0, -1.0, -1.0,
             1.0, -1.0,  1.0,
            -1.0, -1.0,  1.0,

            // Right face
             1.0, -1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0,  1.0,  1.0,
             1.0, -1.0,  1.0,

            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,
            -1.0,  1.0,  1.0,
            -1.0,  1.0, -1.0
        ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    this.setVertexPositionBuffer(gl, vertexPositionBuffer, 3);
    this.setVertexItemNumber(24);

    var vertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    var colors = [
            [1.0, 0.0, 0.0, 1.0], // Front face
            [1.0, 1.0, 0.0, 1.0], // Back face
            [0.0, 1.0, 0.0, 1.0], // Top face
            [1.0, 0.5, 0.5, 1.0], // Bottom face
            [1.0, 0.0, 1.0, 1.0], // Right face
            [0.0, 0.0, 1.0, 1.0]  // Left face
        ];
    var unpackedColors = [];
    for (var i in colors)
    {
        var color = colors[i];
        for (var j=0; j < 4; j++)
        {
            unpackedColors = unpackedColors.concat(color);
        }
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColors), gl.STATIC_DRAW);
    this.setVertexColorBuffer(gl, vertexColorBuffer, 4);
    
    var vertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
    var vertexIndices = [
            0, 1, 2,      0, 2, 3,    // Front face
            4, 5, 6,      4, 6, 7,    // Back face
            8, 9, 10,     8, 10, 11,  // Top face
            12, 13, 14,   12, 14, 15, // Bottom face
            16, 17, 18,   16, 18, 19, // Right face
            20, 21, 22,   20, 22, 23  // Left face
        ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), gl.STATIC_DRAW);
    this.setVertexIndexBuffer(vertexIndexBuffer, 1, 36);
    this.setVertexDrawMethod(gl.TRIANGLES);
    
    this.vertexPositions = vertices;
    this.vertexColors = colors;
    this.textureCoords = [];
    this.vertexIndices = vertexIndices;
}

Flyrock.prototype.initRockModel2 = function(gl)
{
    boxModel = createFullBox2();
    this.bindVertexTextureBuffer(gl, boxModel.vertex, boxModel.vertexItemSize,
            boxModel.vertexItemNumbers,
            boxModel.textureCoords, boxModel.textureCoordItemSize,
            boxModel.index, boxModel.indexItemSize, boxModel.indexItemNumbers);
    
}

Flyrock.prototype.setFly = function(flyTime, startPosition, endPosition)
{
    this.flyTime = flyTime;
    this.setPosition (startPosition);
    this.startPosition = startPosition.slice();
    this.finalPosition = endPosition.slice();
}

Flyrock.prototype.handleFly = function()
{
    if (this.startTime == 0)
        this.startTime = new Date().getTime();
    
    var nowTime = new Date().getTime();
    var elapsed = nowTime - this.startTime;
    var percetange = elapsed / this.flyTime;
    
    for (var i=0; i<3; i++)
        this.position[i] = percetange * (this.finalPosition[i] - this.startPosition[i]) + this.startPosition[i];
    //window.console.log("[Flyrock][handleFly] Fly to: " +
    //        this.position[0] + ", " + this.position[1] + ", " + this.position[2]);
}

Flyrock.prototype.onAnimate = function(elapsed)
{
    this.handleFly();
}

///////////////////////////////////////////////////////////////////////////////

var wallboxModel;

function WallBox(name, wallSize)
{
    window.console.log("[Jumpman][WallBox] Construct wall box: " + name);
    Entity.call(this, name);
    this.wallSize = wallSize;
    this.textureName = "wall.png";
}

WallBox.prototype = new Entity("WallBox Class");
WallBox.prototype.constructor = WallBox;

WallBox.prototype.initResource = function(gl)
{
    wallboxModel = createWallBox(this.wallSize);
    this.bindVertexBuffers(gl, wallboxModel.vertex, wallboxModel.vertexItemSize,
            wallboxModel.vertexItemNumbers,
            wallboxModel.color, wallboxModel.colorItemSize,
            wallboxModel.index, wallboxModel.indexItemSize, wallboxModel.indexItemNumbers);
    this.setVertexDrawMethod(gl.TRIANGLES);
}

WallBox.prototype.initResource2 = function(gl)
{
    wallboxModel = createTextureWallBox(this.wallSize);
    
    this.bindVertexTextureBuffer(gl, wallboxModel.vertex, wallboxModel.vertexItemSize,
            wallboxModel.vertexItemNumbers,
            wallboxModel.textureCoords, wallboxModel.textureCoordItemSize,
            wallboxModel.index, wallboxModel.indexItemSize, wallboxModel.indexItemNumbers);
}

WallBox.prototype.handleLoadedTexture = function(texture)
{
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.wallboxImage);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);
}



