#include<bits/stdc++.h>
using namespace std;

int main(){
  int n;
  cin>>n;
  int numOfFaces = 0;
  for(int i=0;i<n;i++){
    string polyhedron;
    cin>>polyhedron;

    if(polyhedron == "Icosahedron") numOfFaces += 20;
    else if(polyhedron == "Cube") numOfFaces += 6;
    else if(polyhedron == "Tetrahedron") numOfFaces += 4;
    else if(polyhedron == "Dodecahedron") numOfFaces += 12;
    else{
      numOfFaces += 8;
    }
  }
  cout<<numOfFaces;
  return 0;
}