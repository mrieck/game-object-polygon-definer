/*
The MIT License

Copyright (c) 2010-2011-2012 Ibon Tolosana [@hyperandroid]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

Created by:  Mark Rieck (www.markrieck.com)
DATE: 2012-11-25
*/

//this namespace is used in another project...
var ANIMO = ANIMO || {};

(function() {

//shouldnt be global namespace
var   b2Vec2 = Box2D.Common.Math.b2Vec2
 , b2AABB = Box2D.Collision.b2AABB
 , b2BodyDef = Box2D.Dynamics.b2BodyDef
 , b2Body = Box2D.Dynamics.b2Body
 , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
 , b2Fixture = Box2D.Dynamics.b2Fixture
 , b2World = Box2D.Dynamics.b2World
 , b2MassData = Box2D.Collision.Shapes.b2MassData
 , b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
 , b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
 , b2DebugDraw = Box2D.Dynamics.b2DebugDraw
 , b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef
 , b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef
   ;


    ANIMO.PhysicsBoard = function() {
        ANIMO.PhysicsBoard.superclass.constructor.call(this);
        return this;
    };

    ANIMO.PhysicsBoard.prototype= 
	{
		director    : null,
		world       : null,
		mouseIsDown : null,
		mouseJoint  : null,
		mouseActor  : null,
		context     : null,
		groundBody  : null,
		
		init : function(director, world, context) 
		{
			this.director = director;
			this.world = world;
			this.context = context;
			this.groundBody = this.buildGround();
			
			//must return this
			return this;
		},
		mouseDrag : function(e) 
		{
			var x = e.x;
			var y = e.y;

			if(this.mouseIsDown)
			{			
				if(this.mouseJoint)
				{
					//console.log("setting new mousejoint location " + x + "," + y);
					
					var modX = x / CAAT.PMR;
                    var modY = y / CAAT.PMR;
					
					console.log("setting new mousejoint location " + modX + "," + modY);
					
					
					this.mouseJoint.SetTarget(new b2Vec2(modX, modY));
				}				
			}			
		},		
		mouseDown : function(e)
		{
		
            var x= e.x;
            var y= e.y;

			//See if we clicked on existing object
            var point= new CAAT.Point();
            for( var i=0; i<this.childrenList.length; i++ ) 
			{
                point.set( x, y );

                var modelViewMatrixI= this.childrenList[i].modelViewMatrix.getInverse();
                modelViewMatrixI.transformCoord(point);
				
				//iterate through children to find child clicked
    	        if (this.childrenList[i].contains(point.x, point.y)) 
				{
                    this.mouseActor = this.childrenList[i];
					
					var body = this.mouseActor.bodyData;
					var worldBody = this.mouseActor.worldBody;
					var fixture = this.mouseActor.worldBodyFixture;
					
					var md = new b2MouseJointDef();		
			        md.bodyA = this.world.GetGroundBody();
			        md.bodyB = worldBody;
					
					var modX = x / CAAT.PMR;
                    var modY = y / CAAT.PMR;
										
					//var modX = x * CAAT.PMR - (this.width/2);
					//var modY = y * CAAT.PMR - (this.height/2);
														
			        md.target.Set(modX, modY);
			        md.collideConnected = true;
			        md.maxForce = 100.0 * worldBody.GetMass();
			        this.mouseJoint = this.world.CreateJoint(md);
			        this.mouseActor.setAwake(true);		
					
					this.mouseIsDown = true;
					
                    return;
                }
            }		
            
            //if no drag, create a new object
			if(this.context.editorContainer.isReady())
			{
				var x0 = e.x;
				var y0 = e.y;
				this.context.editorContainer.currDefinition;
			
				//console.log("TRYING TO CREATE OUR DEFINED OBJECT");
				var aPolygon = this.createPolygon(
					this.director,
					this.world,
					x0,
					y0,
					{
					    density:        2,
					    restitution:    .7,
					    friction:       .3,
					    tolerance:      .1,
					    polygonScale:   1,
					    polygonDef:     this.context.editorContainer.currDefinition,
					    image:          this.context.editorContainer.currImage
					});		
				
				var velocity= {
				    x: (Math.random()<.5?1:-1) * (1+Math.random()*2),
				    y: (1 + Math.random()*2)
				};

				aPolygon.worldBody.SetLinearVelocity(
				        new Box2D.Common.Math.b2Vec2(
				                velocity.x,
				                velocity.y) );
				aPolygon.worldBody.SetAngularVelocity( Math.PI*Math.random() );

				this.addChild(aPolygon);											
									
			}
			else
			{
				var x0 = e.x;
				var y0 = e.y;

				var ball = this.createBall(
				            this.director,
				            this.world,
				            x0,
				            y0,
				            {
				                radius:         18,
				                density:        2,
				                restitution:    .3,
				                friction:       .2,
				                tolerance:      .1,
				                image:          'ball'
				            });						 
				
				var velocity= {
				    x: (Math.random()<.5?1:-1) * (1+Math.random()*2),
				    y: (1 + Math.random()*2)
				};


				ball.worldBody.SetLinearVelocity(
				        new Box2D.Common.Math.b2Vec2(
				                velocity.x,
				                velocity.y) );
				ball.worldBody.SetAngularVelocity( Math.PI*Math.random() );

				this.addChild(ball);					 
			}			
		},
		mouseUp : function(e)
		{	
			//destroy mouse joint if one was created
			if(this.mouseIsDown)
			{
				this.mouseIsDown = false;
				this.world.DestroyJoint(this.mouseJoint);
			    this.mouseJoint = null;				
			}
		
		},
        createBall : function(director,world,x,y,data) 
		{
            return new CAAT.B2DCircularBody().enableEvents(false).createBody(
                world,
                {
                    x:                      x,
                    y:                      y,
                    bodyType:               Box2D.Dynamics.b2Body.b2_dynamicBody,
                    radius:                 data.radius,
                    density:                data.density,
                    restitution:            data.restitution,
                    friction:               data.friction,
                    bodyDefScaleTolerance:  data.tolerance,
                    image:                  this.director.getImage(data.image),
                    userData:               null
                });
        },
        createPolygon : function(director,world,x,y,data) 
		{
            return new CAAT.B2DPolygonBody().enableEvents(false).createBody(
                world,
                {
                    x:                      x,
                    y:                      y,
                    bodyType:               Box2D.Dynamics.b2Body.b2_dynamicBody,
                    density:                data.density,
                    restitution:            data.restitution,
                    friction:               data.friction,
                    image:                  this.director.getImage(data.image),
                    polygonType:            CAAT.B2DPolygonBody.Type.POLYGON,
                    bodyDef:                data.polygonDef,
                    bodyDefScale:           data.polygonScale,
                    bodyDefScaleTolerance:  data.tolerance,
                    userData:               null
                }
            );
        },	
		buildGround : function()   //not needed, use world.GetGroundBody()
		{
		   //create ground
		   var bodyDef = new b2BodyDef;
		   bodyDef.type = b2Body.b2_staticBody;
		 
		   // positions the center of the object (not upper left!)
		   bodyDef.position.x = (this.width / 2) ;
		   bodyDef.position.y = (this.height / 2) ;
		   bodyDef.angle = (45 * Math.PI) / 180; // radians
		   bodyDef.userData = '__BODY__';
			   
		   var body = this.world.CreateBody(bodyDef);
		   //body.CreateFixture(fixDef);
		   
		   return body;
		 }		
			
    };
	
    extend( ANIMO.PhysicsBoard, CAAT.ActorContainer );
}());



				
//TODO				
//destroy bodies?
/*
ball.addListener({
	actorLifeCycleEvent : function(actor, event, time) {
		if (event === 'expired') {
			var body = actor.worldBody;
			me.world.DestroyBody(body);
		}
	}
});
ball.setFrameTime( scene_time, 7500 );
*/