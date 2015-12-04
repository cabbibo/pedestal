#version 330 core

#define NUM_POINTS 4

const float MAX_TRACE_DISTANCE = 5.;           // max trace distance
const float INTERSECTION_PRECISION = 0.001;    // precision of the intersection
const int NUM_OF_TRACE_STEPS = 100;
const float PI  = 3.14159;

uniform vec3 uDimensions;
uniform float uTime;

in vec3 vPos;
in vec3 vEye;
in vec3 vNorm;
in vec3 vHand1;
in vec3 vHand2;
in vec2 vUV;
in vec3 vPoints[NUM_POINTS];
out vec4 color;

float sdSphere( vec3 p, float s );
float sdBox( vec3 p, vec3 b );
vec2 smoothU( vec2 d1, vec2 d2, float k);
vec3 calcNormal( in vec3 pos );
vec2 calcIntersection( in vec3 ro, in vec3 rd );

//--------------------------------
// Modelling 
//--------------------------------
vec2 map( vec3 pos ) {

  vec2 res;

  res = vec2(-sdBox( pos  , vec3( uDimensions.x  * .5+ INTERSECTION_PRECISION * 2. ) ) , 0. );

  for( int i = 0; i < NUM_POINTS; i++ ){
    vec2 sphere = vec2( sdSphere( pos - vPoints[i] + sin(uTime/float(i+10))*0.4 , .1 ), float(i) + 1. );
    res = smoothU( res , sphere ,.1 );
  }

  return res;
}



void main() {

  vec3 ro = vPos;
  vec3 rd = normalize( vPos - vEye );

  vec3 handDir1 = normalize( vHand1 - ro);
  vec3 handDir2 = normalize( vHand2 - ro);

  vec2 res = calcIntersection( ro , rd );

  vec3 col = vec3( 0. );
  if ( res.y > -.5 ) {

    vec3 pos = ro + rd * res.x;

    vec3 handDir1 = normalize( vHand1 - pos);
    vec3 handDir2 = normalize( vHand2 - pos);
    vec3 norm;

    norm = calcNormal( pos );

    col = vec3(1.0 , 0.6 , 0.1)*  norm * .5 + .5;

  }


  if ( abs(vUV.x - .5) > .49 ||  abs(vUV.y - .5) > .49 ) {
    col = vec3(1.);
  }

  color = vec4( col , 1. );
}


///// Shapes
float sdSphere( vec3 p, float s ){
  return length(p)-s;
}

float sdBox( vec3 p, vec3 b )
{
  vec3 d = abs(p) - b;
  return min(max(d.x,max(d.y,d.z)),0.0) +
         length(max(d,0.0));
}

vec2 smoothU( vec2 d1, vec2 d2, float k)
{
    float a = d1.x;
    float b = d2.x;
    float h = clamp(0.5+0.5*(b-a)/k, 0.0, 1.0);
    return vec2( mix(b, a, h) - k*h*(1.0-h), mix(d2.y, d1.y, pow(h, 2.0)));
}

// Calculates the normal by taking a very small distance,
// remapping the function, and getting normal for that
vec3 calcNormal( in vec3 pos ){
    
  vec3 eps = vec3( 0.001, 0.0, 0.0 );
  vec3 nor = vec3(
      map(pos+eps.xyy).x - map(pos-eps.xyy).x,
      map(pos+eps.yxy).x - map(pos-eps.yxy).x,
      map(pos+eps.yyx).x - map(pos-eps.yyx).x );

  return normalize(nor);
}


vec2 calcIntersection( in vec3 ro, in vec3 rd ){

    float h =  INTERSECTION_PRECISION * 2.0;
    float t = 0.0;
    float res = -1.0;
    float id = -1.;
    
    for( int i=0; i < NUM_OF_TRACE_STEPS ; i++ ){
        
        if( h < INTERSECTION_PRECISION || t > MAX_TRACE_DISTANCE ) break;
        vec2 m = map( ro+rd*t );
        h = m.x;
        t += h;
        id = m.y;
        
    }

    if( t < MAX_TRACE_DISTANCE ) res = t;
    if( t > MAX_TRACE_DISTANCE ) id =-1.0;
    
    return vec2( res , id );
     
}