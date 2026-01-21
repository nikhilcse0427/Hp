#include<iostream>
#include<vector>
using namespace std;

int main(){
  int t; // num of test cases
  cin>>t;
  for(int i=0;i<t;i++){
    int n, summands = 0;
    cin>>n;
    int temp = n;
    while(temp){
      int rem = temp % 10;
      if(rem != 0){
        summands++;
      }
      temp /= 10;
    }
    cout<<summands<<endl;
    int place = 1;
    while(n){
      int rem = n % 10;
      if(rem != 0){
        cout<<rem*place<<" ";
      }
      place *= 10;
      n /= 10;
    }
    cout<<endl;
  }
  return 0;
}