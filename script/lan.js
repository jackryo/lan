var os = require('os');

angular.module('myApp', [])

    .controller('LanController', function($scope){

        // interface list
        $scope.interfaces = [];

        // ip list
        // $scope.ips = [{ip:"no ip",selected:false},{ip:"bbb",selected:false},{ip:"ccc",selected:false},{ip:"ddd",selected:false},{ip:"eee",selected:false},{ip:"fff",selected:false}];
        $scope.ips=[];

        $scope.selectedIP = null;

        $scope.information=[];

        // action history
        $scope.historys = [];

        // num of history
        $scope.num_history = 0;

        //maximum number or history
        MAXIMUM_HISTORY = 50;


        $scope.initParams = function(){
            //initialize interface list
            $scope.interfaces = [];

            //initialize ip list
            $scope.ips=[];

            $scope.selectedIP = null;

            $scope.information=[];

        }

        // initialize interface information
        $scope.initInterface = function(){

            //initialize interfaces
            var interfaces_init = os.networkInterfaces();

            for (var dev in interfaces_init){
                if (dev != "lo"){
                    interfaces_init[dev].forEach(function(details){
                        if (details.family == "IPv4"){
                            $scope.interfaces.push({
                                interface: dev,
                                address: details.address,
                                ipV: details.family,
                                selected: false
                            });
                        }
                    });
                }
            }

            // no interface
            if ($scope.interfaces.length == 0){
                $scope.interfaces.push({
                    interface: "no interface found",
                    address: "",
                    ipV: "",
                    selected: ""
                });
            }

            // log
            $scope.addHistory("initialized interface information", "white");
        }

        $scope.reloadInterface = function(){

            // initialize interface list
            // $scope.interfaces = [];

            $scope.initParams();

            $scope.initInterface();

            // initialize ip list
            // $scope.ips = [{ip: "no ip",selected: false, information: []}];
        }

        // search ip list in same local network
        $scope.searchIP = function(){

            //initialize ip list
            $scope.ips = [];

            // ping and arp for ip list search
            var ping = require("ping");
            var arp = require("node-arp");

            // selected interface
            var my_interfaces = document.getElementById("interface");
            var elements = my_interfaces.options;
            var selected_interface = 0; // list number

            //detect selected interface
            for(var i=0,l=elements.length; l>i;i++){
                if(elements[i].selected){
                    $scope.interfaces[i].selected = true;
                    selected_interface = i;
                }
            }


            //ip v4 version
            if ($scope.interfaces[selected_interface].ipV == "IPv4"){
                // search target subnet
                var split = $scope.interfaces[selected_interface].address.split(".");
                var subnet = split[0]+"."+split[1]+"."+split[2]+".";

                // host list
                var hosts = [];
                var alive_hosts = [];

                // make list
                for (var i=0;i<255;i++){
                    hosts.push(subnet+i);
                }

                // discover alive host
                hosts.forEach(function(host){
                    ping.promise.probe(host, {
                        timeout: 10,
                        extra: ["-i 2"],
                    }).then(function(res){
                        if (res.alive){
                            arp.getMAC(host,function(err,mac){
                                if(mac){
                                    // reflect change of $scope
                                    $scope.$apply(function(){
                                        $scope.ips.push({
                                            ip: host,
                                            selected: false,
                                            information: {
                                                ip: "ip address : " + host,
                                                mac: "mac address : " + mac,
                                                os : "os : "+ "unknown"
                                            }
                                            // mac: mac
                                        });
                                    });
                                }
                            });
                        }
                    });
                });

            }
            // log
            $scope.addHistory("discovering ip hosts finished", "white");
        }

        $scope.changeSelectedIP = function(){
            $scope.ips.forEach(function(ip){
                if($scope.selectedIP[0].includes(ip.ip)){
                    $scope.information = ip.information;
                }
            });
        }

        // scan target ip
        $scope.scanIP = function(){

            // selected ip
            var ips = document.getElementById("ips");
            var elements = my_interfaces.options;
            var selected_ip = 0; // list number

            //detect selected ip
            for (var i=0,l=elements.length; l>i;i++){
                if(elements[i].selected){
                    $scope.ips[i].selected = true;
                    selected_interface = i
                }
            }

            //scan ip
        }

        //logging function
        $scope.addHistory = function(message, color){

            //check maximum size of history
            if($scope.num_history >= MAXIMUM_HISTORY){
                $scope.historys.shift();
            }
            else{
                $scope.num_history += 1;
            }

            //log
            $scope.historys.push({
                message: message,
                color: "color:"+color
            });

        }

        //scrolling history area
        $scope.$on('historyAutoScroll', function() {
            history_zone = document.getElementById("history");
            history_zone.scrollTop = history_zone.scrollHeight;
        });

    })


    //directive for history auto scroll down
    .directive('historyDrawFinish', function ($timeout) {
        return {
            link: function (scope, element, attr) {
                if (scope.$last === true) {
                    $timeout(function () {
                        scope.$emit('historyAutoScroll');
                    });
                }
            }
        }
    });

