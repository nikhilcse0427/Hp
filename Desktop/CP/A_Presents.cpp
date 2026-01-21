#include<iostream>
using namespace std;

int main(){
  int n; // num of friends invited
  cin>>n;
  int arr[n+1];
  for(int i=1;i<=n;i++){
    cin>>arr[i];
  }
  int temp[n+1];
  for(int i=1;i<=n;i++){
    temp[arr[i]] = i;
  }
  for(int i=1;i<=n;i++){
    cout<<temp[i]<<" ";
  }
  return 0;
}