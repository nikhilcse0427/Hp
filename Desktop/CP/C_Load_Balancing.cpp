#include<iostream>
using namespace std;

int main(){
  int n;
  cin>>n;
  int sum = 0;
  for(int i=0;i<n;i++){
    cin>>arr[i];
    sum += arr[i];
  }
  //logic
  avg = sum/n;
  int low = sum/n;
  int high = low+1;
  int k = sum % n;
  sort(arr, arr+n);
  for(int i=0;i<n-k;i++){
    if(aar[i]>low){
      seconds += arr[i]-low;
    }
  }
  for(int i=n-k;i<n;i++){
    if(arr[i]>high){
      seconds += arr[i]-high;
    }
  }
  int seconds = 0;
  cout<<seconds;
  return 0;
}