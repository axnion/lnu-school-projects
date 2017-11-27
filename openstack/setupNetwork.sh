#!/bin/bash

networkName="2dv611_network"
subnetName="2dv611_subnet"
routerName="2dv611_router"

if [[ $(openstack network list --name $networkName) ]]; then
	echo "network $networkName exists... Skipping create network"
else
	echo "network $networkName does not exist... Creating network"
	openstack network create $networkName
fi


if [[ $(openstack subnet list --name $subnetName)  ]]; then
	echo "subnet $subnetName exists... Skipping creating subnet"
else
	echo "subet $subnetName does not exist... Creating subnet"
	openstack subnet create $subnetName --network $networkName --subnet-range 192.168.1.0/24
fi 


if [[ $(openstack router list --name $routerName)  ]]; then
        echo "router $routerName exists... Skipping creating router"
else
        echo "router $routerName does not exist... Creating router"
	openstack router create $routerName
	openstack router set $routerName --external-gateway public
	openstack router add subnet $routerName $subnetName
fi
