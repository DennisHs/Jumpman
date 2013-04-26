// Framework of WebGL initialize and basic functions.
// Basic functions in this script, maybe replace by other scripts
// and do some advance jobs.
//
// Import this engine and call create function to retrieve object.
//
// Dependency:
// glMatrix(glMatrix-0.9.5.min.js): vector and matrix operations
// glMatrix(gl-matrix-2.2.0-7.js): vector and matrix operations

// The contect name definition of WebGL.
// Maybe change to "webgl" some day.
var webgl_canvas_context_name = "experimental-webgl";

// Global engine settings.
var CookieGLEngineSettings = {
    "webgl_canvas_name": "main_canvas",
    //"shader-vs": "shader-vs",
    //"shader-fs": "shader-fs",
    "shader-vs": "shader-vs-texture",
    "shader-fs": "shader-fs-texture",
};

/**
 * CookieGLEngine namespace.
 * This object should be create once and other script should use
 * the exists instance.
 */
var CookieGLEngine = function()
{
    ///////////////////////////////////////////////////////////////////////////
    // Public attributes.
    ///////////////////////////////////////////////////////////////////////////
    var gl;
    var mvMatrix = mat4.create();
    
    // TODO: Implement shader program list.
    var shaderProgram;
    
    ///////////////////////////////////////////////////////////////////////////
    // Private attributes.
    ///////////////////////////////////////////////////////////////////////////
    var canvas;
    var mvMatrixStack = [];
    var prjMatrix = mat4.create();
    var pauseRequest = false;
    var renderActions = [];
    var textureCache = {};
    
    ///////////////////////////////////////////////////////////////////////////
    // Public methods.
    ///////////////////////////////////////////////////////////////////////////
    
    /**
     * Initialize WebGL context with gave canvas ID.
     */
    var initWebGL = function()
    {
        window.console.log("[CookieGLEngine][initWebGL] initWebGL");
        
        try
        {
            canvas = document.getElementById(CookieGLEngineSettings["webgl_canvas_name"]);
            gl = canvas.getContext(webgl_canvas_context_name);
            CookieGLEngineSettings["viewportWidth"] = canvas.width;
            CookieGLEngineSettings["viewportHeight"] = canvas.height;
        }
        catch (e)
        {
            window.console.log("[CookieGLEngine][initWebGL][Error] Get context exception: " + e);
        }
        
        if (!gl)
        {
            alert("Could not initialize WebGL!! :(");
        }
        
        window.console.log("[CookieGLEngine][initWebGL] initWebGL end");    
        return gl;
    }
    
    var getGL = function()
    {
        return gl;
    }
    
    var getViewportWidth = function()
    {
        return CookieGLEngineSettings["viewportWidth"];
    }
    
    var getViewportHeight = function()
    {
        return CookieGLEngineSettings["viewportHeight"];
    }
    
    var initContextHandler = function()
    {
        window.console.log("[CookieGLEngine][initContextHandler] initContextHandler");
        
        if (!canvas)
        {
            window.console.log("[CookieGLEngine][initContextHandler][Error] No canvas element.");
            return;
        }
        
        //canvas = WebGLDebugUtils.makeLostContextSimulatingCanvas(canvas);
        // tell the simulator when to lose context.
        //canvas.loseContextInNCalls(1);
        
        // TODO: Implement context lost/restore function.
        //canvas.addEventListener("webglcontextlost", handleContextLost, false);
        //canvas.addEventListener("webglcontextrestored", handleContextRestored, false);
        
        window.console.log("[CookieGLEngine][initContextHandler] initContextHandler end");
    }
    
    var getShader = function(shaderID)
    {
        window.console.log("[CookieGLEngine][getShader] Shader ID: " + shaderID);
        
        var shaderScript = document.getElementById(shaderID);
        if (!shaderScript)
        {
            window.console.log("[CookieGLEngine][getShader][Error] Cannot get shder ID: " + shaderID);
            return null;
        }

        var str = "";
        var elem = shaderScript.firstChild;
        while (elem)
        {
            if (elem.nodeType == 3)
            {
                str += elem.textContent;
            }
            elem = elem.nextSibling;
        }

        var shader;
        if (shaderScript.type == "x-shader/x-fragment")
        {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        }
        else if (shaderScript.type == "x-shader/x-vertex")
        {
            shader = gl.createShader(gl.VERTEX_SHADER);
        }
        else
        {
            return null;
        }

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
        
        window.console.log("[CookieGLEngine][getShader] getShader");

        return shader;
    }
    
    var createColorShaderProgram = function()
    {
        window.console.log("[CookieGLEngine][createColorShaderProgram] start");
        
        var vertexShader = getShader(CookieGLEngineSettings["shader-vs"]);
        var fragmentShader = getShader(CookieGLEngineSettings["shader-fs"]);

        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
        {
            alert("Could not initialise shaders");
            return;
        }
        
        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
        
        shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
        gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
        
        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        
        window.console.log("[CookieGLEngine][createColorShaderProgram] end");
    }
    
    var createTextureShaderProgram = function()
    {
        window.console.log("[CookieGLEngine][createTextureShaderProgram] start");
        
        var vertexShader = getShader(CookieGLEngineSettings["shader-vs"]);
        var fragmentShader = getShader(CookieGLEngineSettings["shader-fs"]);
        
        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
        {
            alert("Could not initialise shaders");
            return;
        }
        
        window.console.log("[CookieGLEngine][createTextureShaderProgram] end");
        
        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
        
        shaderProgram.vertexTextureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
        gl.enableVertexAttribArray(shaderProgram.vertexTextureCoordAttribute);
        
        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
    }
    
    var initShaders = function()
    {
        window.console.log("[CookieGLEngine][initShaders] initShaders");
        
        //createColorShaderProgram();
        createTextureShaderProgram();
        
        window.console.log("[CookieGLEngine][initShaders] initShaders end");
    }
    
    var getShaderProgram = function()
    {
        return shaderProgram;
    }
    
    var pushMVMatrix = function()
    {
        var copy = mat4.create();
        mat4.copy(copy, mvMatrix);
        mvMatrixStack.push(copy);
    }

    var popMVMatrix = function()
    {
        if (mvMatrixStack.length == 0)
        {
            throw "Invalid popMatrix!";
        }
        mvMatrix = mvMatrixStack.pop();
        return mvMatrix;
    }

    var getMVMatrix = function()
    {
        return mvMatrix;
    }
    
    var getPrjMatrix = function()
    {
        return prjMatrix;
    }
    
    var setMatrixUniforms = function()
    {
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, prjMatrix);
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    }
    
    var onCanvasReshape = function()
    {
        var width = getViewportWidth();
        var height = getViewportHeight();
        if (canvas.clientWidth != width || canvas.clientHeight != height)
        {
            CookieGLEngineSettings["viewportWidth"] = canvas.clientWidth;
            CookieGLEngineSettings["viewportHeight"] = canvas.clientHeight;
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            window.console.log("[CookieGLEngine][onCanvasReshape] Change canvas size to: " +
                CookieGLEngineSettings["viewportWidth"] + "x" + CookieGLEngineSettings["viewportHeight"]);
        }
    }
    
    function handleLoadedTexture(texture)
    {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    
    var initTexture = function(textureName)
    {
        if (textureCache[textureName])
            return textureCache[textureName];
        
        var texture = gl.createTexture();
        texture.image = new Image();
        texture.image.onload = function ()
        {
            handleLoadedTexture(texture)
        }
        texture.image.src = textureName;
        textureCache[textureName] = texture;
        
        return texture;
    }
    
    var releaseTexture = function(textureName)
    {
        // TODO: Release texture buffer.
    }
    
    ///////////////////////////////////////////////////////////////////////////
    // Utility public methods.
    ///////////////////////////////////////////////////////////////////////////
    
    var degToRad = function(degrees)
    {
        return degrees * Math.PI / 180;
    }
    
    ///////////////////////////////////////////////////////////////////////////
    // Template public methods, should be overwrite.
    ///////////////////////////////////////////////////////////////////////////
    function onInitGLComplete() {window.console.log("[CookieGLEngine][onInitGLComplete] Not implement.");}
    function initBuffers() {window.console.log("[CookieGLEngine][initBuffers] Not implement.");}
    function drawScene() {}
    function animate() {}
    
    ///////////////////////////////////////////////////////////////////////////
    // Main animation tick (pump loop).
    ///////////////////////////////////////////////////////////////////////////
    var pushRenderAction = function(action)
    {
        renderActions.push(action);
    }
    
    var resetRenderAction = function()
    {
        renderActions = [];
    }
    
    var tick = function()
    {
        requestAnimFrame(tick);
        if (pauseRequest)
            return;
        for (var i in renderActions)
        {
            renderActions[i]();
        }
    }
    
    var run = function()
    {
        window.console.log("[CookieGLEngine][run] running engine ...");
        
        // Initialize WebGL with canvas.
        gl = initWebGL();
        if (!gl)
        {
            window.console.log("[CookieGLEngine][run][Error] Initialize WebGL failed.");
            return;
        }
        
        // Init GL resource.
        initContextHandler();
        initShaders();
        this.onInitGLComplete();
        
        // Initialize other resource.
        this.initBuffers();
        
        // Clear canvas.
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        
        // Start frame animation.
        this.resetRenderAction();
        this.pushRenderAction(this.drawScene);
        this.pushRenderAction(this.animate);
        this.tick();
        
        window.console.log("[CookieGLEngine][run] run function end");
    }
    
    return {
        // Methods
        initWebGL: initWebGL,
        getGL: getGL,
        getViewportWidth: getViewportWidth,
        getViewportHeight: getViewportHeight,
        initContextHandler: initContextHandler,
        getShader: getShader,
        initShaders: initShaders,
        getShaderProgram: getShaderProgram,
        pushMVMatrix: pushMVMatrix,
        popMVMatrix: popMVMatrix,
        getMVMatrix: getMVMatrix,
        getPrjMatrix: getPrjMatrix,
        
        setMatrixUniforms: setMatrixUniforms,
        onCanvasReshape: onCanvasReshape,
        initTexture: initTexture,
        releaseTexture: releaseTexture,
        
        degToRad: degToRad,
        
        onInitGLComplete: onInitGLComplete,
        initBuffers: initBuffers,
        drawScene: drawScene,
        animate: animate,
        
        pushRenderAction: pushRenderAction,
        resetRenderAction: resetRenderAction,
        tick: tick,
        run: run,
        
        // Debug
        pauseRequest: pauseRequest,
        canvas: canvas,
    };
};



