
// Saving in Array [DancerName, IPAdress, Hostname]
// Need to modify MAC_LIST to include all RPis

// Test ver.
const MAC_LIST: { [key: string]: string[] }= {
  "B8:27:EB:B9:32:66": ["3_hans", "192.168.0.184", "lightdance-03"],
  // "B8:27:EB:C7:17:B0": ["7_henning", "192.168.0.64", "lightdance-07"],
  "B8:27:EB:92:42:E5": ["7_henning", "192.168.0.184", "lightdance-07"],
  "B8:27:EB:88:5A:8E": ["5_alice", "192.168.0.22", "lightdance-05"],
  "B8:27:EB:FA:D3:62": ["6_some_umbrella", "192.168.0.72", "lightdance-06"],
  "B8:27:EB:D7:6F:98": ["11_other_umbrella", "192.168.0.135", "lightdance-11"],
};


export { MAC_LIST };
