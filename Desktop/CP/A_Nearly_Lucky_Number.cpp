#include<iostream>
using namespace std;

int main(){
  long long n;
  cin>>n;
  int count = 0;
  while(n){
    int rem = n % 10;
    if(rem == 4 || rem == 7 && count <= 7){
      count++;
      n /= 10;
    }else{
      cout<<"NO";
      return 0;
    }
  }
  if(count == 4 || count == 7){
    cout<<"YES";
  }else{
    cout<<"NO";
  }
  return 0;
}