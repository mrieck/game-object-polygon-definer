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

        ANIMO.EditPolygon = function() {
            ANIMO.EditPolygon.superclass.constructor.call(this);
            return this;
        };

	    ANIMO.EditPolygon.prototype= 
		{
			director :      null,		
			scene    :      null,
			context  :      null,
			polygonPoints : null,
			tempPoint : null,
			currImage : null,
			currDefinition : null,		
			imageLoaded :   false,   //The main sprite for animation, object also contains special animo properties
			pathActor : null,
			pathDone : false,
			//takes director, scene, spriteImage of the main image
	        init: function(director, scene, context) 
			{
				this.director = director;
				this.scene = scene;
				this.context = context;
				this.polygonPoints = new Array();
				
				
				this.setBackgroundImage(director.getImage('no_image'), true).
						setLocation(0,0);
						

                this.pathActor= new CAAT.PathActor().
                        setBounds(0,0,this.width, this.height).
                        enableEvents(false).
                        setInteractive(false);

				var me = this;
				
                this.pathActor.paint= function( director, time ) 
				{
                    CAAT.PathActor.prototype.paint.call(this, director, time);
					
					if(me.polygonPoints.length < 1)
					{
						return;
					}
					
					//Draw the existing points
					var ctx= director.ctx;
					ctx.fillStyle='#248EFF';
					for( var i=0; i < me.polygonPoints.length; i++ ) 
					{				
						ctx.beginPath();
			            ctx.arc(
			                me.polygonPoints[i].x,
			                me.polygonPoints[i].y,
			                2,
			                0,
			                2*Math.PI,
			                false) ;
			            ctx.fill();
					}
					
					//Draw a polygon encompassing the points
					ctx.save();
					ctx.fillStyle = "rgba(36, 142, 255, 0.5)";
					ctx.beginPath();
					
					if(me.polygonPoints.length < 2)
					{
						return;
					}
					
					ctx.moveTo(me.polygonPoints[0].x, me.polygonPoints[0].y);

					for(var p = 1; p < me.polygonPoints.length; p++)
					{
						ctx.lineTo( me.polygonPoints[p].x, me.polygonPoints[p].y);
					}
					if(!me.pathDone)
					{
						ctx.lineTo(me.tempPoint.x, me.tempPoint.y);					
					}
					ctx.closePath();
					ctx.fill();					
					
					ctx.restore();	
                };
				
                this.addChild( this.pathActor );
							
				console.log("THIS11111")
				console.log(this);
				
				//must return this
				return this;
	        },
			mouseClick : function(e)
			{
				console.log("THIS2222");
				console.log(this);
				if(!this.pathDone)
				{
					var ps = this.polygonPoints;
					
					ps.push(new CAAT.Point( e.x, e.y ));
					
					var p= new CAAT.Path().beginPath( ps[0].x, ps[0].y );
	                
					for( var i=1, l=ps.length; i<l; i++ ) 
					{
	                    p.addLineTo( ps[i].x, ps[i].y );
	                }
	                 
					p.endPath().setInteractive(false);
					
					this.pathActor.setPath( p );					
				}
			},
			mouseDblClick : function(e)
			{
				if(this.pathDone)
				{
					return;					
				}
			
				//End the Path and blah
				var ps = this.polygonPoints;
				
				//ps.push(new CAAT.Point( e.x, e.y ));
				
				var p= new CAAT.Path().beginPath( ps[0].x, ps[0].y );
                
				for( var i=1, l=ps.length; i<l; i++ ) 
				{
                    p.addLineTo( ps[i].x, ps[i].y );
                }
                 
				p.endPath().setInteractive(false);
				
				this.pathActor.setPath( p );				
				if(ps.length >= 3)
				{				
					this.pathDone = true;					
					
					var centerX = this.width / 2;
					var centerY = this.height / 2;

					
					
					var pointObjects = new Array();
					var lastX = -1000;
					var lastY = -1000;
					for(var m = 0; m < ps.length; m++)
					{
						var pX = ps[m].x - centerX;
						var pY = ps[m].y - centerY;
						
						if(pX == lastX && pY == lastY)
						{
							//last point
							console.log("skipped duplicate point");
							continue;
						}
						lastX = pX;
						lastY = pY;

						var onePoint = { x: (pX) , y : (pY)};						
						pointObjects.push(onePoint);				
					}
					this.currDefinition = pointObjects;	
					
					this.context.setPolygonDefinition(this.currDefinition);			
					
					/*
					console.log("SETTING POINT ARR TO: ");
					console.log(this.currDefinition);
					console.log("CURR IMAGE: " + this.currImage);
					console.log("PathDone is: " + this.pathDone);					
					*/
				}				
				
			},
            mouseMove : function(e) 
			{
				var ps = this.polygonPoints;
				
				this.tempPoint = new CAAT.Point( e.x, e.y );
				
				if(ps.length <= 0)
				{
					return;					
				}
				
				var p = new CAAT.Path().beginPath( ps[0].x, ps[0].y );
                
				for( var i=1, l=ps.length; i<l; i++ ) 
				{
                    p.addLineTo( ps[i].x, ps[i].y );
                }
				if(!this.pathDone)
				{
					p.addLineTo(this.tempPoint);				
				}
                 
				p.endPath().setInteractive(false);
				
				this.pathActor.setPath( p );								
			},	
			isReady : function()
			{
				if(!this.pathDone || this.currImage == null || this.currDefinition == null)
				{
					return false;					
				}	
				return true;
			},		
			resetPolygons : function()
			{
				this.polygonPoints = new Array();
				this.pathActor.setPath(null);		
				this.pathDone = false;	
				this.currDefinition = null;				
			},
			setImageTo : function(director, theImage)
			{			
				console.log(theImage);
				//resize
				this.setBackgroundImage(director.getImage(theImage, true));
				
				//clear the polygons
				this.resetPolygons();
				this.pathActor.setBounds(0, 0, this.width, this.height);

				this.currImage = theImage;				
	
			}
	    };

        extend( ANIMO.EditPolygon, CAAT.ActorContainer );
    }());


