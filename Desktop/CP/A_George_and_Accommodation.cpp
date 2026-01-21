#include<bits/stdc++.h>
using namespace std;

int main(){
  int n;
  cin>>n;
  int numOfRoomsAvail = 0;
  for(int i=0;i<n;i++){
    int person, cap;
    cin>>person>>cap;
    if(cap-person>=2) numOfRoomsAvail++;
  }
  cout<<numOfRoomsAvail;

  return 0;
}