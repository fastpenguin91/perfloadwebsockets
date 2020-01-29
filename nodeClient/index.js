const os = require('os');

function performanceData(){
  return new Promise(async (resolve, reject)=>{

    const cpus = os.cpus();
    // The node program that captures local performance data
    // sends it up to socket.io server
    // req:
    // - farmhash
    // - socket.io-client

    // what do we need to know from node about performance?
    // cpu load (current)
    // memory usage
    // -free
    const freeMem = os.freemem();
    // - total/
    const totalMem = os.totalmem();
    const usedMem = totalMem - freeMem;

    const memUseage = Math.floor(usedMem/totalMem*100)/100;
    // os type
    const osType = os.type() == 'Darwin' ? 'Mac' : os.type();
    // uptime
    const upTime = os.uptime();
    console.log(upTime);
    // cpu info
    // type
    const cpuModel = cpus[0].model;
    // number of cores
    const numCores = cpus.length;
    // clock speed
    const cpuSpeed = cpus[0].speed;
    const cpuLoad = await getCpuLoad();
    resolve({
      freeMem, totalMem, usedMem,memUseage,osType,upTime,cpuModel,numCores,cpuSpeed,cpuLoad
    });
  });
}


// cpus is all numCores we need average of all the cores which will give us the cpu average
function cpuAverage(){
  const cpus = os.cpus();
  // get ms in each mode, but this num is since reboot. so get now and in 100ms and compare.
  let idleMs = 0;
  let totalMs = 0;
  //loop through each core
  cpus.forEach((aCore)=>{
    //    loop through each property of the current core
    for(type in aCore.times){
      totalMs += aCore.times[type];
    }
    idleMs += aCore.times.idle;
  });
  return {
    idle: idleMs / cpus.length,
    total: totalMs / cpus.length
  }
}
// because times property is time since boot we get now times and 100ms from now times. compare and that will give us current load
function getCpuLoad(){
  return new Promise((resolve, reject)=>{

    const start = cpuAverage();
    setTimeout(()=> {
      const end = cpuAverage();
      const idleDifference = end.idle - start.idle;
      const totalDifference = end.total - start.total;
      // console.log(idleDifference, totalDifference);
      // calc % of used cpu
      const percentageCpu = 100 - Math.floor(100 * idleDifference / totalDifference);
      resolve(percentageCpu);
    },100);
  });
}

performanceData().then((allPerformanceData)=>{
  console.log(allPerformanceData);
});
