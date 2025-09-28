const LIBS = {
  get_gl_context: function(canvas_id) {
    const canvas = document.getElementById(canvas_id);
    return canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  },

  get_shader: function(gl, id, str) {
    let shader;
    if (id == "shader-fs") {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (id == "shader-vs") {
      shader = gl.createShader(gl.VERTEX_SHADER);
    }
    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Error compiling shader: " + gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  },

  degToRad: function(angle) {
    return angle * Math.PI / 180;
  }
};

// ========== Matrix utils ==========

const mat4 = {
  create: function() {
    return [1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1];
  },

  perspective: function(out, fovy, aspect, near, far) {
    const f = 1.0 / Math.tan(fovy / 2);
    const nf = 1 / (near - far);

    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;

    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;

    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * nf;
    out[11] = -1;

    out[12] = 0;
    out[13] = 0;
    out[14] = (2 * far * near) * nf;
    out[15] = 0;

    return out;
  },

  translate: function(out, a, v) {
    const x = v[0], y = v[1], z = v[2];
    if (a !== out) {
      for (let i = 0; i < 12; i++) {
        out[i] = a[i];
      }
    }
    out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
    out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
    out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
    out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    return out;
  },

  rotateY: function(out, a, rad) {
    const s = Math.sin(rad);
    const c = Math.cos(rad);

    const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
    const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
    const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];

    out[0] = a00 * c - a20 * s;
    out[1] = a01 * c - a21 * s;
    out[2] = a02 * c - a22 * s;
    out[3] = a03 * c - a23 * s;
    out[4] = a10;
    out[5] = a11;
    out[6] = a12;
    out[7] = a13;
    out[8] = a00 * s + a20 * c;
    out[9] = a01 * s + a21 * c;
    out[10] = a02 * s + a22 * c;
    out[11] = a03 * s + a23 * c;
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
  },

    rotateX: function(out, a, rad) {
    const s = Math.sin(rad);
    const c = Math.cos(rad);

    const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
    const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];

    out[4] = a10 * c + a20 * s;
    out[5] = a11 * c + a21 * s;
    out[6] = a12 * c + a22 * s;
    out[7] = a13 * c + a23 * s;
    out[8] = a20 * c - a10 * s;
    out[9] = a21 * c - a11 * s;
    out[10] = a22 * c - a12 * s;
    out[11] = a23 * c - a13 * s;
    return out;
  },

  rotateZ: function(out, a, rad) {
    const s = Math.sin(rad), c = Math.cos(rad);
    const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
    const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];

    out[0] = a00 * c + a10 * s;
    out[1] = a01 * c + a11 * s;
    out[2] = a02 * c + a12 * s;
    out[3] = a03 * c + a13 * s;

    out[4] = a10 * c - a00 * s;
    out[5] = a11 * c - a01 * s;
    out[6] = a12 * c - a02 * s;
    out[7] = a13 * c - a03 * s;

    out[8]  = a[8];  out[9]  = a[9];
    out[10] = a[10]; out[11] = a[11];
    out[12] = a[12]; out[13] = a[13];
    out[14] = a[14]; out[15] = a[15];
    return out;
    }
};


