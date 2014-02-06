  // This function arranges the data.
  // Passes it to compute_centroid call
  // and then to cloud2 call for data visualization.
  function readData(text)
  {
    //Extract lines
    var lines = text.trim().split(/[\r\n]+/g);
    var L = lines.length ;
    var data_arr = new Array(L);
    // Array to hold centroid, cost and deviation results
    var result_arr = new Array(3);
    var COL = 4;
    var ii = 0;
    //initialize and create the 2nd dimension for result_arr
    for (var i = 0; i< 3; i++)
    {
        result_arr[i] = new Array(COL);
        //Using 4 rows rather than 3 to keep the average weight
        //of cloud as part of centroid info
        for (var j=0; j< 4; j++)
        {
            result_arr[i][j] = 0;
        }
    }
    for (var i = 0; i < L; i++)
    {
      data_arr[i] = new Array(COL);
      // Accept space and comma as data delimiter
      var this_line = lines[i].trim().split(/[ ,]+/);
      // If total columns are less than 4, move to next row
      // Ignore missing data
      if (this_line.length < 4) {
	continue;
      }
      
      for (var j = 0; j< COL; j++)
      {
	data_arr[ii][j] = this_line[j];
      }
      ii++;
    }
    compute_centroid(data_arr,ii,COL, result_arr);
    cloud2(data_arr,ii, result_arr);
  }
  
  // Respond to selecting a file, or drop of a file
  // Triggered by change and drop events.
  // Extracts and stores the content of file in a variable.
  // Calls readData function.
  function handleFileSelect(evt) {
    if (evt.type =="change") {
        var file = evt.target.files[0]; 
    }
    else
    {
        evt.stopPropagation();
        evt.preventDefault();

        var file = evt.dataTransfer.files[0]; 
    }
    
    if (file) {
      var out1 = document.getElementById("filename");
      out1.innerHTML = "";
      out1.appendChild(document.createTextNode("File: "+file.name));
     
      var reader = new FileReader();  
      reader.readAsText(file);
      reader.onloadend = function(){
        var text = reader.result;
        readData(text);
      }

    } else{
      alert("Failed to load the file!")
    }
  }

  // Computes centroid, average deviation and cost.
  
  function compute_centroid(data_arr, N, COL, result_arr)
  {
    var centrx = 0.0;
    var centry = 0.0;
    var centrz = 0.0;
    var total_mass = 0.0;
    var costx = 0;
    var costy = 0;
    var costz = 0;
    var devx = 0;
    var devy = 0;
    var devz = 0;
    var max = 0;
    var max_w = 0;
    
    for (var i = 0; i < N; i++)
    {
      total_mass += Number(data_arr[i][3]);
      centrx += Number(data_arr[i][0])*Number(data_arr[i][3]);
      centry += Number(data_arr[i][1])*Number(data_arr[i][3]);
      centrz += Number(data_arr[i][2])*Number(data_arr[i][3]);
      // this is to estimate the magnitude; is done in one dimension only
      // which should be good enough doe estimating magnitude.
      if (data_arr[i][0] > max) {
        max = data_arr[i][0];
      }
      if (data_arr[i][3] > max_w) {
        max_w = data_arr[i][3];
      }
    }

    centrx /= total_mass;
    centry /= total_mass;
    centrz /= total_mass;
    
    for (var i = 0; i < N; i++)
    {
      costx += centrx - Number(data_arr[i][0]);
      costy += centry - Number(data_arr[i][1]);
      costz += centrz - Number(data_arr[i][2]);
      devx += (centrx - Number(data_arr[i][0]))*(centrx - Number(data_arr[i][0]))/N;
      devy += (centry - Number(data_arr[i][1]))*(centry - Number(data_arr[i][1]))/N;
      devz += (centrz - Number(data_arr[i][2]))*(centrz - Number(data_arr[i][2]))/N;
    }
    devx = Math.sqrt(devx);
    devy = Math.sqrt(devy);
    devz = Math.sqrt(devz);
    // Display the values on the form.
    var out1 = document.getElementById("data1");
    out1.innerHTML = "";
    var out2 = document.getElementById("data2");
    out2.innerHTML = "";
    var out3 = document.getElementById("data3");
    out3.innerHTML = "";
    var info = document.getElementById("Cinfo");
    info.innerHTML = "";
    var centr_str = "Centroid: ("+centrx.toFixed(2)+" , "+centry.toFixed(2)+" , "+centrz.toFixed(2)+")";
    var cost_str = "Cost: ("+costx.toFixed(2)+" , "+costy.toFixed(2)+" , "+costz.toFixed(2)+")";
    var dev_str = "Deviation:("+devx.toFixed(2)+" , "+devy.toFixed(2)+" , "+devz.toFixed(2)+")";
    out1.appendChild(document.createTextNode(centr_str));
    out2.appendChild(document.createTextNode(cost_str));
    out3.appendChild(document.createTextNode(dev_str));
    info.appendChild(document.createTextNode("      Black sphere represents the centroid."));
    
    // Scaled dimensions are between 0-100
    // Scale the data ... 
    var sFactor = Math.round(100.0/max);
    // Scale the weight for visualization
    var sFactor_w = Math.round(5.0/max_w);
    
    for (var i=0; i< N; i++)
    {
        for (var j=0;j<3; j++)
            data_arr[i][j] *= sFactor
            
        data_arr[i][3] *= sFactor_w;
    }

    result_arr[0][0] = centrx*sFactor;
    result_arr[0][1] = centry*sFactor;
    result_arr[0][2] = centrz*sFactor;
    result_arr[0][3] = total_mass*sFactor_w/N;
    result_arr[1][0] = costx;
    result_arr[1][1] = costy;
    result_arr[1][2] = costz;
    result_arr[2][0] = devx;
    result_arr[2][1] = devy;
    result_arr[2][2] = devz;   
  
  }
  // Displays the cluster of spheres
  // Arguments data_arr is the array for
  // particle data, N is the number of records
  // and result_arr had the values for centroid,
  // avg cost and avg deviation.
 function cloud2(data_arr,N,result_arr)
 {
  var magenta = [1,0,1];
  var blue = [0,0,1];
  var green = [0,1,0];
  var red = [1,0,0];
  var lblue = [0,1,1];
  var black = [0,0,0];
  var yellow = [1,1,0];
  var colors = [green,red,magenta,lblue,blue];
  var div = document.getElementById("pict");
  div.innerHTML = ""
  div.style.background="lightblue";
  // create and initialize a 3D renderer
  var r = new X.renderer3D();
  r.container = div;
  r.init();
  
  var sphere_centroid = new X.sphere;
  sphere_centroid.radius = result_arr[0][3]*1.5;
  sphere_centroid.color = black;
  sphere_centroid.center = [0,0,0];//[result_arr[0][0],result_arr[0][1],result_arr[0][2]];
  r.add(sphere_centroid);
  var p = new X.mesh();
  p.color = yellow;
  p.opacity = 0.5;
  for (var i = 0; i < N; i++)
  {
    var sphere = new X.sphere();
    var cylinder = new X.cylinder();
    sphere.opacity = 0.8;
    // To represent the size according the weight
    // weight is directly used to define radius.
    sphere.radius = data_arr[i][3]*1.5;
    var indx = Math.round(data_arr[i][3]) % 5;
    sphere.color = colors[4-indx];
    var x = data_arr[i][0] - result_arr[0][0];
    var y = data_arr[i][1] - result_arr[0][1];
    var z = data_arr[i][2] - result_arr[0][2];
    sphere.transform.translateX(x);
    sphere.transform.translateY(y);
    sphere.transform.translateZ(z);
    p.points = [x,y,x];
    cylinder.start = [0, 0, 0];
    cylinder.end = [x, y, z];
    cylinder.radius = 0.2;
    r.add(sphere);
    r.add(cylinder);
  }

  r.render();
  r.onRender = function() {

    // rotate the camera in X-direction
    r.camera.rotate([1, 0]);
    
  };
}


  function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  }
